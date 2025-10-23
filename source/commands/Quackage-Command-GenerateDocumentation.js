const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const libPath = require('path');

class QuackageCommandGenerateDocumentation extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'generate-documentation';
		this.options.Description = 'Generate documentation from source files and markdown files';

		this.options.CommandArguments.push({ Name: '<output_folder>', Description: 'The folder in which to generate content' });

		this.options.CommandOptions.push({ Name: '-m, --markdown [markdown_documentation_folder]', Description: 'Folder with markdwon documentation; subfolders are okay.', Default: '' });
		this.options.CommandOptions.push({ Name: '-s, --source [source_code_folder]', Description: 'Folder with javascript source to parse jsdoc from.', Default: false });

		this.options.Aliases.push('dgen');

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		const libFilePersistence = this.services.FilePersistence;

		this.log.info(`Generating documentation...`);

		let tmpAnticipate = this.fable.newAnticipate();

		this.log.info(`Documentation Phase 0: Preparing configurations...`);
		this.log.info(`Documentation Phase 1: Gathering documentation metadata...`);
		this.log.info(`Documentation Phase 2: Gathering code metadata...`);
		this.log.info(`Documentation Phase 3: Generating structured description...`);

		return tmpAnticipate.wait(
			function (pError)
			{
				if (pError)
				{
					return fCallback(pError);
				}

				this.log.info(`Documentation generation complete.`);

				return fCallback();
			}.bind(this));
	};
}

module.exports = QuackageCommandGenerateDocumentation;