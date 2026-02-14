const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const libPath = require('path');

class QuackageCommandDocuservePrepareLocal extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'prepare-local';
		this.options.Description = 'Copy local pict and pict-docuserve JS bundles into a docs folder for offline use.';

		this.options.CommandArguments.push({ Name: '[docs_folder]', Description: 'The documentation folder to stage local JS bundles into.' });

		this.options.Aliases.push('local-docs');
		this.options.Aliases.push('stage-local');

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpDocsFolder = libPath.resolve(this.ArgumentString || './docs');

		this.log.info(`Staging local JS bundles into documentation folder...`);
		this.log.info(`  Target: ${tmpDocsFolder}`);

		if (!libFS.existsSync(tmpDocsFolder))
		{
			return fCallback(new Error(`Documentation folder not found at [${tmpDocsFolder}].`));
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
				'prepare-local',
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

module.exports = QuackageCommandDocuservePrepareLocal;
