const libPict = require('pict');
const libFS = require('fs');
const libPath = require('path');
const libHTTP = require('http');

class QuackageExampleService extends libPict.ServiceProviderBase
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.serviceType = 'QuackageExampleService';
	}

	// --- Folder scanning ---

	gatherExampleFolders(pBasePath)
	{
		let tmpExampleFolders = [];

		if (!libFS.existsSync(pBasePath))
		{
			return tmpExampleFolders;
		}

		let tmpEntries = libFS.readdirSync(pBasePath, { withFileTypes: true });
		for (let i = 0; i < tmpEntries.length; i++)
		{
			if (!tmpEntries[i].isDirectory())
			{
				continue;
			}

			let tmpDirName = tmpEntries[i].name;

			// Skip node_modules and hidden folders
			if (tmpDirName === 'node_modules' || tmpDirName.startsWith('.'))
			{
				continue;
			}

			let tmpFolderPath = libPath.join(pBasePath, tmpDirName);
			let tmpPackagePath = libPath.join(tmpFolderPath, 'package.json');

			if (libFS.existsSync(tmpPackagePath))
			{
				tmpExampleFolders.push(
					{
						Name: tmpDirName,
						Path: tmpFolderPath,
						PackagePath: tmpPackagePath
					});
			}
		}

		return tmpExampleFolders;
	}

	gatherServableExamples(pBasePath)
	{
		let tmpExamples = [];

		if (!libFS.existsSync(pBasePath))
		{
			return tmpExamples;
		}

		let tmpEntries = libFS.readdirSync(pBasePath, { withFileTypes: true });
		for (let i = 0; i < tmpEntries.length; i++)
		{
			if (!tmpEntries[i].isDirectory())
			{
				continue;
			}

			let tmpDirName = tmpEntries[i].name;

			// Skip node_modules and hidden folders
			if (tmpDirName === 'node_modules' || tmpDirName.startsWith('.'))
			{
				continue;
			}

			let tmpFolderPath = libPath.join(pBasePath, tmpDirName);

			// Check for dist/index.html (standard example pattern)
			let tmpDistIndex = libPath.join(tmpFolderPath, 'dist', 'index.html');
			if (libFS.existsSync(tmpDistIndex))
			{
				// Try to get a nice name from package.json
				let tmpDisplayName = this.formatDisplayName(tmpDirName);
				let tmpPackagePath = libPath.join(tmpFolderPath, 'package.json');
				if (libFS.existsSync(tmpPackagePath))
				{
					try
					{
						let tmpPkg = JSON.parse(libFS.readFileSync(tmpPackagePath, 'utf8'));
						if (tmpPkg.description)
						{
							tmpDisplayName = tmpPkg.description;
						}
					}
					catch (pError)
					{
						// Use the formatted folder name
					}
				}

				tmpExamples.push(
					{
						Name: tmpDirName,
						DisplayName: tmpDisplayName,
						RelativePath: `${tmpDirName}/dist/index.html`,
						Type: 'example'
					});
				continue;
			}

			// Check for direct index.html (debug folder pattern)
			let tmpDirectIndex = libPath.join(tmpFolderPath, 'index.html');
			if (libFS.existsSync(tmpDirectIndex))
			{
				tmpExamples.push(
					{
						Name: tmpDirName,
						DisplayName: this.formatDisplayName(tmpDirName),
						RelativePath: `${tmpDirName}/index.html`,
						Type: 'debug'
					});
			}
		}

		return tmpExamples;
	}

	// --- Display helpers ---

	formatDisplayName(pFolderName)
	{
		// Convert folder_name to Title Case Display Name
		return pFolderName
			.split(/[-_]/)
			.map((pWord) => pWord.charAt(0).toUpperCase() + pWord.slice(1))
			.join(' ');
	}

	hashProjectNameToPort(pProjectName)
	{
		let tmpHash = 0;
		for (let i = 0; i < pProjectName.length; i++)
		{
			let tmpChar = pProjectName.charCodeAt(i);
			tmpHash = ((tmpHash << 5) - tmpHash) + tmpChar;
			tmpHash = tmpHash & tmpHash; // Convert to 32-bit integer
		}
		// Map to range 9000-9500
		return 9000 + (Math.abs(tmpHash) % 501);
	}

	getMimeType(pExtension)
	{
		let tmpMimeTypes =
			{
				'.html': 'text/html',
				'.js': 'text/javascript',
				'.css': 'text/css',
				'.json': 'application/json',
				'.png': 'image/png',
				'.jpg': 'image/jpeg',
				'.jpeg': 'image/jpeg',
				'.gif': 'image/gif',
				'.svg': 'image/svg+xml',
				'.ico': 'image/x-icon',
				'.woff': 'font/woff',
				'.woff2': 'font/woff2',
				'.ttf': 'font/ttf',
				'.map': 'application/json'
			};
		return tmpMimeTypes[pExtension] || 'application/octet-stream';
	}

	// --- HTML generation ---

	generateIndexHTML(pProjectName, pExamples, pPort)
	{
		let tmpExampleListItems = '';
		for (let i = 0; i < pExamples.length; i++)
		{
			let tmpExample = pExamples[i];
			let tmpTypeLabel = tmpExample.Type === 'debug' ? ' <span class="type-badge debug">debug</span>' : '';
			tmpExampleListItems += `\t\t\t<li><a href="${tmpExample.RelativePath}">${tmpExample.DisplayName}${tmpTypeLabel}</a></li>\n`;
		}

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Examples - ${pProjectName}</title>
	<style>
		*, *::before, *::after { box-sizing: border-box; }
		body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAEDCD; color: #264653; }

		/* --- Header Bar --- */
		.pict-example-header { display: flex; align-items: stretch; background: #264653; border-bottom: 3px solid #E76F51; }
		.pict-example-badge { background: #E76F51; color: #fff; padding: 0.6rem 1rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: flex; align-items: center; gap: 0.5rem; }
		.pict-example-badge svg { width: 14px; height: 14px; fill: #fff; flex-shrink: 0; }
		.pict-example-app-name { padding: 0.6rem 1rem; color: #FAEDCD; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; }
		.pict-example-module { margin-left: auto; padding: 0.6rem 1rem; color: #D4A373; font-size: 0.75rem; display: flex; align-items: center; letter-spacing: 0.03em; }

		/* --- Content Area --- */
		.pict-example-content { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
		.pict-example-content h1 { color: #264653; font-size: 1.5rem; margin: 0 0 0.5rem; }
		.pict-example-content .subtitle { color: #6B705C; font-size: 0.85rem; margin: 0 0 1.5rem; }

		/* --- Example List --- */
		.example-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
		.example-list li { background: #fff; border: 1px solid #D4A373; border-left: 4px solid #E76F51; border-radius: 4px; transition: border-color 0.15s, box-shadow 0.15s; }
		.example-list li:hover { border-left-color: #264653; box-shadow: 0 2px 8px rgba(38,70,83,0.1); }
		.example-list a { display: block; padding: 0.75rem 1rem; text-decoration: none; color: #264653; font-weight: 500; font-size: 0.95rem; }
		.example-list a:hover { color: #E76F51; }

		/* --- Type Badge --- */
		.type-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 3px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: middle; margin-left: 0.5rem; }
		.type-badge.debug { background: #264653; color: #FAEDCD; }

		/* --- Footer --- */
		.pict-example-footer { text-align: center; padding: 1.5rem; color: #6B705C; font-size: 0.75rem; border-top: 1px solid #D4A373; margin-top: 2rem; }
	</style>
</head>
<body>
	<div class="pict-example-header">
		<div class="pict-example-badge">
			<svg viewBox="0 0 16 16"><polygon points="8,1 10,6 16,6 11,9.5 13,15 8,11.5 3,15 5,9.5 0,6 6,6"/></svg>
			Pict Example
		</div>
		<div class="pict-example-app-name">Example Index</div>
		<div class="pict-example-module">${pProjectName}</div>
	</div>
	<div class="pict-example-content">
		<h1>Example Applications</h1>
		<p class="subtitle">${pExamples.length} example(s) found &mdash; served on port ${pPort}</p>
		<ul class="example-list">
${tmpExampleListItems}		</ul>
	</div>
	<div class="pict-example-footer">
		Served by quackage examples-serve
	</div>
</body>
</html>`;
	}

	// --- Executable resolution ---

	resolveExecutable(pName)
	{
		let tmpLocations =
			[
				`${this.fable.AppData.CWD}/node_modules/.bin/${pName}`,
				`${__dirname}/../../../.bin/${pName}`,
				`${__dirname}/../../node_modules/.bin/${pName}`
			];

		for (let i = 0; i < tmpLocations.length; i++)
		{
			if (libFS.existsSync(tmpLocations[i]))
			{
				return tmpLocations[i];
			}
		}

		// Fall back to just the bare command name (rely on PATH)
		return pName;
	}

	// --- Build all examples ---

	buildExamples(pExamplesFolder, fCallback)
	{
		let tmpExamplesFolder = libPath.resolve(pExamplesFolder || './example_applications');

		this.log.info(`Building all examples in [${tmpExamplesFolder}] ...`);

		// Gather example folders from example_applications and debug
		let tmpExampleFolders = this.gatherExampleFolders(tmpExamplesFolder);
		let tmpDebugFolder = libPath.join(tmpExamplesFolder, 'debug');
		let tmpDebugPackage = libPath.join(tmpDebugFolder, 'package.json');
		if (libFS.existsSync(tmpDebugPackage))
		{
			let tmpAlreadyIncluded = tmpExampleFolders.some((pFolder) => pFolder.Name === 'debug');
			if (!tmpAlreadyIncluded)
			{
				tmpExampleFolders.push(
					{
						Name: 'debug',
						Path: tmpDebugFolder,
						PackagePath: tmpDebugPackage
					});
			}
		}

		if (tmpExampleFolders.length < 1)
		{
			this.log.warn(`No example application folders with package.json found in [${tmpExamplesFolder}].`);
			return fCallback();
		}

		this.log.info(`Found ${tmpExampleFolders.length} example application(s) to build.`);

		// Build each example in series
		this.fable.Utility.eachLimit(
			tmpExampleFolders, 1,
			(pExample, fExampleCallback) =>
			{
				this.log.info(`####### Building example: ${pExample.Name} #######`);

				let tmpPackage;
				try
				{
					tmpPackage = JSON.parse(libFS.readFileSync(pExample.PackagePath, 'utf8'));
				}
				catch (pError)
				{
					this.log.error(`Error reading package.json for [${pExample.Name}]: ${pError.message}`);
					return fExampleCallback();
				}

				if (!tmpPackage.scripts || !tmpPackage.scripts.build)
				{
					this.log.warn(`No build script in [${pExample.Name}] -- skipping.`);
					return fExampleCallback();
				}

				let tmpNpxLocation = this.resolveExecutable('npx');

				this.fable.QuackageProcess.execute(
					tmpNpxLocation,
					['quack', 'build'],
					{ cwd: pExample.Path },
					(pBuildError) =>
					{
						if (pBuildError)
						{
							this.log.error(`Build error in [${pExample.Name}]: ${pBuildError.message}`);
						}

						if (tmpPackage.copyFiles || tmpPackage.copyFilesSettings)
						{
							this.log.info(`Copying files for [${pExample.Name}] ...`);
							this.fable.QuackageProcess.execute(
								tmpNpxLocation,
								['quack', 'copy'],
								{ cwd: pExample.Path },
								(pCopyError) =>
								{
									if (pCopyError)
									{
										this.log.error(`Copy error in [${pExample.Name}]: ${pCopyError.message}`);
									}
									return fExampleCallback();
								});
						}
						else
						{
							return fExampleCallback();
						}
					});
			},
			(pError) =>
			{
				if (pError)
				{
					this.log.error(`Error building examples: ${pError.message}`);
				}
				else
				{
					this.log.info(`All examples built successfully!`);
				}
				return fCallback(pError);
			});
	}

	// --- Serve examples ---

	serveExamples(pExamplesFolder, pPort, fCallback)
	{
		let tmpExamplesFolder = libPath.resolve(pExamplesFolder || './example_applications');
		let tmpProjectName = this.fable.AppData.Package.name || 'unknown-project';
		let tmpPort = pPort || this.hashProjectNameToPort(tmpProjectName);

		this.log.info(`Scanning for example applications in [${tmpExamplesFolder}] ...`);

		let tmpExamples = this.gatherServableExamples(tmpExamplesFolder);

		if (tmpExamples.length < 1)
		{
			this.log.warn(`No servable examples found in [${tmpExamplesFolder}].  Looking for subfolders with dist/index.html or index.html.`);
			return fCallback();
		}

		this.log.info(`Found ${tmpExamples.length} servable example(s).`);

		let tmpIndexHTML = this.generateIndexHTML(tmpProjectName, tmpExamples, tmpPort);

		let tmpServer = libHTTP.createServer(
			(pRequest, pResponse) =>
			{
				let tmpRequestURL = pRequest.url.split('?')[0];

				if (tmpRequestURL === '/' || tmpRequestURL === '/index.html')
				{
					pResponse.writeHead(200, { 'Content-Type': 'text/html' });
					pResponse.end(tmpIndexHTML);
					return;
				}

				let tmpFilePath = libPath.join(tmpExamplesFolder, decodeURIComponent(tmpRequestURL));

				if (!tmpFilePath.startsWith(tmpExamplesFolder))
				{
					pResponse.writeHead(403);
					pResponse.end('Forbidden');
					return;
				}

				if (libFS.existsSync(tmpFilePath) && libFS.statSync(tmpFilePath).isDirectory())
				{
					tmpFilePath = libPath.join(tmpFilePath, 'index.html');
				}

				if (!libFS.existsSync(tmpFilePath))
				{
					pResponse.writeHead(404);
					pResponse.end('Not Found');
					return;
				}

				let tmpExtension = libPath.extname(tmpFilePath).toLowerCase();
				let tmpMimeType = this.getMimeType(tmpExtension);

				try
				{
					let tmpContent = libFS.readFileSync(tmpFilePath);
					pResponse.writeHead(200, { 'Content-Type': tmpMimeType });
					pResponse.end(tmpContent);
				}
				catch (pError)
				{
					pResponse.writeHead(500);
					pResponse.end('Internal Server Error');
				}
			});

		tmpServer.listen(tmpPort,
			() =>
			{
				this.log.info(`##############################################`);
				this.log.info(`  Example server running at http://localhost:${tmpPort}/`);
				this.log.info(`  Project: ${tmpProjectName}`);
				this.log.info(`  Serving ${tmpExamples.length} example(s):`);
				for (let i = 0; i < tmpExamples.length; i++)
				{
					this.log.info(`    - ${tmpExamples[i].DisplayName}: http://localhost:${tmpPort}/${tmpExamples[i].RelativePath}`);
				}
				this.log.info(`##############################################`);
				this.log.info(`Press Ctrl+C to stop.`);
			});

		tmpServer.on('error',
			(pError) =>
			{
				if (pError.code === 'EADDRINUSE')
				{
					this.log.error(`Port ${tmpPort} is already in use.  Try specifying a different port with -p.`);
				}
				else
				{
					this.log.error(`Server error: ${pError.message}`);
				}
				return fCallback(pError);
			});

		// Keep the process running (don't call fCallback -- server is long-lived)
	}
}

module.exports = QuackageExampleService;
