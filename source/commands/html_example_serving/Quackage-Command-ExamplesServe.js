const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libPath = require('path');

class QuackageCommandExamplesServe extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'examples-serve';
		this.options.Description = 'Serve example applications with an auto-generated index page.';

		this.options.CommandArguments.push({ Name: '[examples_folder]', Description: 'The examples folder (defaults to ./example_applications).' });

		this.options.CommandOptions.push({ Name: '-p, --port [port]', Description: 'Port to serve on (default: auto-hashed from project name between 9000-9500).', Default: '' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpExamplesFolder = libPath.resolve(this.ArgumentString || './example_applications');
		let tmpPort = this.CommandOptions.port ? parseInt(this.CommandOptions.port, 10) : 0;
		this.fable.QuackageExampleService.serveExamples(tmpExamplesFolder, tmpPort, fCallback);
	}
}

module.exports = QuackageCommandExamplesServe;
