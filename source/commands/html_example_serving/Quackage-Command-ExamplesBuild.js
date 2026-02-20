const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
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

	onRunAsync(fCallback)
	{
		let tmpExamplesFolder = libPath.resolve(this.ArgumentString || './example_applications');
		this.fable.QuackageExampleService.buildExamples(tmpExamplesFolder, fCallback);
	}
}

module.exports = QuackageCommandExamplesBuild;
