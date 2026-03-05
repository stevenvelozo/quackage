const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const libPath = require('path');

class QuackageCommandCheckDependencies extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'check-dependencies';
		this.options.Description = 'Check package.json for local file:// references and list all dependency versions';
		this.options.Aliases.push('check-deps');
		this.options.Aliases.push('checkdeps');

		this.options.CommandOptions.push({ Name: '-a, --allow-file-package-references', Description: 'Allow file:// references without returning an error exit code', Default: false });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpPackage = this.fable.AppData.Package;
		let tmpCWD = this.fable.AppData.CWD;
		let tmpAllowFileReferences = this.CommandOptions.allowFilePackageReferences ? true : false;

		let tmpFileReferenceCount = 0;
		let tmpMismatchCount = 0;

		this.log.info(`Checking dependencies for ${tmpPackage.name}@${tmpPackage.version} ...`);

		let tmpDependencySections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

		for (let i = 0; i < tmpDependencySections.length; i++)
		{
			let tmpSectionName = tmpDependencySections[i];

			if (!tmpPackage.hasOwnProperty(tmpSectionName))
			{
				continue;
			}

			let tmpDependencies = tmpPackage[tmpSectionName];
			let tmpDependencyNames = Object.keys(tmpDependencies);

			if (tmpDependencyNames.length < 1)
			{
				continue;
			}

			console.log('');
			this.log.info(`--- ${tmpSectionName} ---`);

			for (let j = 0; j < tmpDependencyNames.length; j++)
			{
				let tmpDepName = tmpDependencyNames[j];
				let tmpDepVersion = tmpDependencies[tmpDepName];
				let tmpIsFileReference = (typeof(tmpDepVersion) === 'string') && tmpDepVersion.startsWith('file://');

				// Try to read the installed version from node_modules
				let tmpInstalledVersion = '(not installed)';
				try
				{
					let tmpInstalledPackagePath = libPath.join(tmpCWD, 'node_modules', tmpDepName, 'package.json');
					if (libFS.existsSync(tmpInstalledPackagePath))
					{
						let tmpInstalledPackage = JSON.parse(libFS.readFileSync(tmpInstalledPackagePath, 'utf8'));
						tmpInstalledVersion = tmpInstalledPackage.version || '(unknown)';
					}
				}
				catch (pError)
				{
					tmpInstalledVersion = '(error reading)';
				}

				let tmpVersionMatch = true;
				// For non-file references, check if the installed version satisfies the specified range
				if (!tmpIsFileReference && tmpInstalledVersion !== '(not installed)' && tmpInstalledVersion !== '(error reading)' && tmpInstalledVersion !== '(unknown)')
				{
					// Simple display check -- show mismatch if the specified version doesn't contain the installed version
					// This is intentionally simple; a full semver check would require a library
					if (tmpDepVersion !== tmpInstalledVersion && !tmpDepVersion.includes(tmpInstalledVersion))
					{
						tmpVersionMatch = false;
						tmpMismatchCount++;
					}
				}

				if (tmpIsFileReference)
				{
					tmpFileReferenceCount++;
					this.log.warn(`  [FILE REF] ${tmpDepName}: ${tmpDepVersion}  -->  installed: ${tmpInstalledVersion}`);
				}
				else if (!tmpVersionMatch)
				{
					this.log.info(`  [MISMATCH] ${tmpDepName}: ${tmpDepVersion}  -->  installed: ${tmpInstalledVersion}`);
				}
				else
				{
					this.log.info(`  [OK]       ${tmpDepName}: ${tmpDepVersion}  -->  installed: ${tmpInstalledVersion}`);
				}
			}
		}

		console.log('');

		if (tmpMismatchCount > 0)
		{
			this.log.warn(`Found ${tmpMismatchCount} version mismatch(es) between package.json and node_modules.`);
		}

		if (tmpFileReferenceCount > 0)
		{
			this.log.warn(`Found ${tmpFileReferenceCount} file:// reference(s) in package.json!`);
			if (!tmpAllowFileReferences)
			{
				this.log.error(`Refusing to publish with local file:// references. Use --allow-file-package-references to override.`);
				this.fable.QuackageProcess.exitParentProcess(1);
			}
			else
			{
				this.log.info(`File references allowed by --allow-file-package-references flag.`);
			}
		}
		else
		{
			this.log.info(`No file:// references found.  All clear for publishing!`);
		}

		return fCallback();
	};
}

module.exports = QuackageCommandCheckDependencies;
