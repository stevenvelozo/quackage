const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const libPath = require('path');

class QuackageCommandExamplesBuild extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'examples-build';
		this.options.Description = 'Build all example applications in the example_applications and debug folders.';

		this.options.CommandArguments.push({ Name: '[examples_folder]', Description: 'The examples folder (defaults to ./example_applications).' });

		this.addCommand();
	}

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

	onRunAsync(fCallback)
	{
		let tmpExamplesFolder = libPath.resolve(this.ArgumentString || './example_applications');

		this.log.info(`Building all examples in [${tmpExamplesFolder}] ...`);

		// Gather example folders from example_applications and debug
		let tmpExampleFolders = this.gatherExampleFolders(tmpExamplesFolder);
		let tmpDebugFolder = libPath.join(tmpExamplesFolder, 'debug');
		// The debug folder itself may be buildable
		let tmpDebugPackage = libPath.join(tmpDebugFolder, 'package.json');
		if (libFS.existsSync(tmpDebugPackage))
		{
			// Check if debug is already in the list (it would be from the main scan)
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

				// Read the example's package.json to check for a build script
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

				// Check if there is a build script
				if (!tmpPackage.scripts || !tmpPackage.scripts.build)
				{
					this.log.warn(`No build script in [${pExample.Name}] -- skipping.`);
					return fExampleCallback();
				}

				// Find npx (we use npx to run quack build in each folder)
				let tmpNpxLocation = this.resolveExecutable('npx');
				if (!tmpNpxLocation)
				{
					this.log.warn(`Could not find npx to build [${pExample.Name}] -- skipping.`);
					return fExampleCallback();
				}

				// Run npm run build in the example folder
				this.fable.QuackageProcess.execute(
					tmpNpxLocation,
					['quack', 'build'],
					{ cwd: pExample.Path },
					(pBuildError) =>
					{
						if (pBuildError)
						{
							this.log.error(`Build error in [${pExample.Name}]: ${pBuildError.message}`);
							// Continue building other examples
						}

						// Now run quack copy if the package has copyFiles
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

	resolveExecutable(pName)
	{
		let tmpLocations =
			[
				`${this.fable.AppData.CWD}/node_modules/.bin/${pName}`,
				`${__dirname}/../../../../../.bin/${pName}`,
				`${__dirname}/../../../../node_modules/.bin/${pName}`
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
}

module.exports = QuackageCommandExamplesBuild;
