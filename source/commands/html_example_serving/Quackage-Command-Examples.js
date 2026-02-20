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
		let tmpPort = this.CommandOptions.port ? parseInt(this.CommandOptions.port, 10) : 0;

		this.log.info(`Building and serving examples from [${tmpExamplesFolder}] ...`);

		this.fable.QuackageExampleService.buildExamples(tmpExamplesFolder,
			(pBuildError) =>
			{
				if (pBuildError)
				{
					this.log.warn(`Some examples had build errors, but continuing to serve what we have...`);
				}

				// examples-serve doesn't call back (long-lived server), so neither do we
				this.fable.QuackageExampleService.serveExamples(tmpExamplesFolder, tmpPort, fCallback);
			});
	}
}

module.exports = QuackageCommandExamples;
