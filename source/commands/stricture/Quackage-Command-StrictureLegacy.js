const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libFS = require('fs');
const libPath = require('path');

class QuackageCommandStrictureLegacy extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'stricture-legaacy';
		this.options.Description = 'Run a legacy stricture command.';

		this.options.CommandArguments.push({ Name: '<output_folder>', Description: 'The folder in which to generate content' });

		this.options.CommandOptions.push({ Name: '-m, --markdown [markdown_documentation_folder]', Description: 'Folder with markdwon documentation; subfolders are okay.', Default: '' });

		this.options.Aliases.push('str');

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		const libFilePersistence = this.services.FilePersistence;

		const tmpOperationState = {};
		tmpOperationState.RawOutputFolderPath = this.ArgumentString;

		tmpOperationState.RawSourceCodeFolder = this.CommandOptions.source;

		return fCallback();
	};
}

module.exports = QuackageCommandStrictureLegacy;