const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const libPath = require('path');

class QuackageCommandDocuserveServe extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'docs-serve';
		this.options.Description = 'Serve a documentation folder locally using pict-docuserve.';

		this.options.CommandArguments.push({ Name: '<docs_folder>', Description: 'The documentation folder to serve.' });

		this.options.CommandOptions.push({ Name: '-p, --port [port]', Description: 'Port to serve on.', Default: '3333' });

		this.options.Aliases.push('serve-docs');

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpDocsFolder = libPath.resolve(this.ArgumentString || '.');
		let tmpPort = this.CommandOptions.port || '3333';

		this.log.info(`Serving documentation with pict-docuserve...`);
		this.log.info(`  Docs folder: ${tmpDocsFolder}`);
		this.log.info(`  Port: ${tmpPort}`);

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
				'serve',
				tmpDocsFolder,
				'--port', tmpPort
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

module.exports = QuackageCommandDocuserveServe;
