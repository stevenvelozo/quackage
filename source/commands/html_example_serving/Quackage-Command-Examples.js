const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libPath = require('path');

class QuackageCommandExamples extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'examples';
		this.options.Description = 'Build all example applications then serve them with an auto-generated index page.';

		this.options.CommandArguments.push({ Name: '[examples_folder]', Description: 'The examples folder (defaults to ./example_applications).' });

		this.options.CommandOptions.push({ Name: '-p, --port [port]', Description: 'Port to serve on (default: auto-hashed from project name between 9000-9500).', Default: '' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpExamplesFolder = libPath.resolve(this.ArgumentString || './example_applications');
		let tmpPort = this.CommandOptions.port || '';

		this.log.info(`Building and serving examples from [${tmpExamplesFolder}] ...`);

		// First, run examples-build
		let tmpBuildCommand = this.pict.servicesMap['QuackageCommandExamplesBuild'];
		if (!tmpBuildCommand)
		{
			this.log.error(`Could not find the examples-build command.  Make sure it is registered.`);
			return fCallback(new Error('examples-build command not found'));
		}

		// Set the argument string so examples-build uses the same folder
		tmpBuildCommand.ArgumentString = tmpExamplesFolder;

		tmpBuildCommand.onRunAsync(
			(pBuildError) =>
			{
				if (pBuildError)
				{
					this.log.warn(`Some examples had build errors, but continuing to serve what we have...`);
				}

				// Now run examples-serve
				let tmpServeCommand = this.pict.servicesMap['QuackageCommandExamplesServe'];
				if (!tmpServeCommand)
				{
					this.log.error(`Could not find the examples-serve command.  Make sure it is registered.`);
					return fCallback(new Error('examples-serve command not found'));
				}

				tmpServeCommand.ArgumentString = tmpExamplesFolder;
				tmpServeCommand.CommandOptions = tmpServeCommand.CommandOptions || {};
				if (tmpPort)
				{
					tmpServeCommand.CommandOptions.port = tmpPort;
				}

				// examples-serve doesn't call back (long-lived server), so neither do we
				tmpServeCommand.onRunAsync(fCallback);
			});
	}
}

module.exports = QuackageCommandExamples;
