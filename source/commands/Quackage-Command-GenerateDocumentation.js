const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libOS = require('os');
const libFS = require('fs');
const libPath = require('path');

const libJSDocWrapper = require('./Quackage-JSDoc-Wrapper.js');

class QuackageCommandGenerateDocumentation extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'generate-documentation';
		this.options.Description = 'Generate documentation from source files and markdown files';

		this.options.CommandArguments.push({ Name: '<output_folder>', Description: 'The folder in which to generate content', Default: './dist' });

		this.options.CommandOptions.push({ Name: '-m, --markdown [markdown_documentation_folder]', Description: 'Folder with markdwon documentation; subfolders are okay.', Default: '' });
		this.options.CommandOptions.push({ Name: '-s, --source [source_code_folder]', Description: 'Folder with javascript source to parse jsdoc from.', Default: false });
		// this.options.CommandOptions.push({ Name: '-g, --source_glob [source_code_glob_pattern]', Description: 'Glob pattern for source code files to include.', Default: '' });
		// this.options.CommandOptions.push({ Name: '-p, --private', Description: 'Include private members in the generated documentation.', Default: false });
		this.options.CommandOptions.push({ Name: '-c, --config [jsdoc_config_file]', Description: 'Path to a JSDoc config file to use when generating documentation.', Default: false });

		this.options.Aliases.push('dgen');

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		const libFilePersistence = this.services.FilePersistence;

		const tmpOperationState = {};
		tmpOperationState.RawOutputFolderPath = this.ArgumentString;

		tmpOperationState.RawSourceCodeFolder = this.CommandOptions.source;
		//tmpOperationState.SourceCodeGlobPattern = this.CommandOptions.source_glob;

		tmpOperationState.RawMarkdownFolder = this.CommandOptions.markdown;

		tmpOperationState.IncludePrivate = this.CommandOptions.private;
		tmpOperationState.JSDocConfigPath = this.CommandOptions.config;

		this.log.info(`Generating documentation...`);

		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(`Documentation Phase 0: Preparing configurations...`);
				tmpOperationState.OutputFolderPath = libPath.resolve(tmpOperationState.RawOutputFolderPath);
				tmpOperationState.OutputFolderExists = libFilePersistence.existsSync(tmpOperationState.OutputFolderPath);
				this.log.info(`Resolved output folder path to [${tmpOperationState.OutputFolderPath}] -- Exists: ${tmpOperationState.OutputFolderExists}`);
				
				if (tmpOperationState.RawSourceCodeFolder)
				{
					tmpOperationState.SourceCodeFolderPath = libPath.resolve(tmpOperationState.RawSourceCodeFolder);
					tmpOperationState.SourceCodeFolderExists = libFilePersistence.existsSync(tmpOperationState.SourceCodeFolderPath);
					this.log.info(`Resolved source code folder path to [${tmpOperationState.SourceCodeFolderPath}] -- Exists: ${tmpOperationState.SourceCodeFolderExists}`);
					//tmpOperationState.SourceCodeFolderMatchesGlob = libPath.join(tmpOperationState.SourceCodeFolderPath, tmpOperationState.SourceCodeGlobPattern);
					// tmpOperationState.SourceCodeFolderJSDocParameter = [tmpOperationState.SourceCodeFolderMatchesGlob];
					tmpOperationState.SourceCodeFolderJSDocParameter = [tmpOperationState.SourceCodeFolderPath];
					//this.log.info(`Using source code glob pattern [${tmpOperationState.SourceCodeGlobPattern}] -- Full JSDoc parameter: ${tmpOperationState.SourceCodeFolderMatchesGlob}`);
				}
				else
				{
					tmpOperationState.SourceCodeFolder = false;
					this.log.info(`No source code folder specified; skipping source code documentation generation.`);
				}

				return fNext();
			}.bind(this));

		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(`Documentation Phase 1: Gathering documentation metadata...`);
				libJSDocWrapper(tmpOperationState.SourceCodeFolderJSDocParameter, null, false, './', 60000, [], './TestOutput.json', fNext);
			}.bind(this));

		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(`Documentation Phase 2: Gathering code metadata...`);

				return fNext();
			}.bind(this));

		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(`Documentation Phase 3: Generating structured description...`);
				tmpOperationState.OutputFolderPath = libPath.resolve(tmpOperationState.RawOutputFolderPath);
				this.log.info(`Resolved output folder path to [${tmpOperationState.OutputFolderPath}]`);
				
				if (tmpOperationState.RawSourceCodeFolder)
				{
					tmpOperationState.SourceCodeFolder = libPath.resolve(tmpOperationState.RawSourceCodeFolder);
					this.log.info(`Resolved source code folder path to [${tmpOperationState.SourceCodeFolder}]`);
				}
				else
				{
					tmpOperationState.SourceCodeFolder = false;
					this.log.info(`No source code folder specified; skipping source code documentation generation.`);
				}

				return fNext();
			}.bind(this));


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