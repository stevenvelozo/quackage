const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const libPath = require('path');

class QuackageCommandDocuserveInject extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'docuserve-inject';
		this.options.Description = 'Inject pict-docuserve application assets into a documentation folder for static hosting.';

		this.options.CommandArguments.push({ Name: '<docs_folder>', Description: 'Target documentation folder to inject docuserve assets into.' });

		this.options.Aliases.push('docuserve');
		this.options.Aliases.push('inject-docs');

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpDocsFolder = libPath.resolve(this.ArgumentString || '.');

		this.log.info(`Injecting pict-docuserve assets into documentation folder...`);
		this.log.info(`  Target: ${tmpDocsFolder}`);

		// Ensure the output folder exists
		if (!libFS.existsSync(tmpDocsFolder))
		{
			this.log.info(`Creating documentation folder [${tmpDocsFolder}]...`);
			libFS.mkdirSync(tmpDocsFolder, { recursive: true });
		}

		// Find the pict-docuserve binary
		let tmpDocuserveLocation = this.resolveExecutable('pict-docuserve');
		if (!tmpDocuserveLocation)
		{
			return fCallback(new Error(`Could not find pict-docuserve.  Make sure it is installed (npm install pict-docuserve).`));
		}

		this.log.info(`Found pict-docuserve at [${tmpDocuserveLocation}]`);

		this.fable.QuackageProcess.execute(
			tmpDocuserveLocation,
			[
				'inject',
				tmpDocsFolder
			],
			{ cwd: this.fable.AppData.CWD },
			fCallback
		);
	}

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

		return false;
	}
}

module.exports = QuackageCommandDocuserveInject;
