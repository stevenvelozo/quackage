const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const libPath = require('path');

const _DEFAULT_DOCUMENT_DEFINITION = require('../Default-Documentation-Definition.json');

class QuackageCommandBuildDocumentation extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'documentation-build';
		this.options.Description = 'Build your npm module into a dist folder';

		this.options.CommandArguments.push({ Name: '<output_folder>', Description: 'The folder in which to generate content' });

		this.options.CommandOptions.push({ Name: '-d, --document [document_definition_file]', Description: 'Document definition file', Default: '' });
		this.options.CommandOptions.push({ Name: '-m, --meadow [meadow_schema_file]', Description: 'Meadow schema file for data dictionary', Default: '' });

		this.options.Aliases.push('db');
		this.options.Aliases.push('docubuild');

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		// Lazily add the services only for this command
		const documentationGatherService = this.fable.addAndInstantiateServiceType('DocumentationGather', require('../services/Quackage-Documentation-Gather.js'));
		const documentationCompileService = this.fable.addAndInstantiateServiceType('DocumentationCompile', require('../services/Quackage-Documentation-Compile.js'));
		const documentationDeployService = this.fable.addAndInstantiateServiceType('DocumentationDeploy', require('../services/Quackage-Documentation-Deploy.js'));

		const libFilePersistence = this.services.FilePersistence;

		this.log.info(`Building documentation...`);

		let tmpAnticipate = this.fable.newAnticipate();

		this.log.info(`Documentation Phase 0: Preparing configurations....`);

		this.log.info('...Checking for document definition...');
		if (this.CommandOptions.document)
		{
			this.log.info(`...Loading document definition from relative path [${this.CommandOptions.document}]...`);
			try
			{
				this.pict.AppData.documentDefinition = require(libPath.resolve(`${this.fable.AppData.CWD}/${this.CommandOptions.document}`));
			}
			catch(pError)
			{
				this.log.error(`Error loading document definition: ${pError.message}`);
				this.pict.AppData.documentDefinition = _DEFAULT_DOCUMENT_DEFINITION;
			}
		}
		else
		{
			this.pict.AppData.documentDefinition = _DEFAULT_DOCUMENT_DEFINITION;
		}

		// Eventually maybe take a configuration file for the settings -- this may migrate out of Quackage entirely
		// For now, scan CWD
		documentationGatherService.pathsToScan.push(libPath.resolve(`${this.fable.AppData.CWD}`));

		this.fable.AppData.OutputFolderPath = libPath.resolve(`${this.fable.AppData.CWD}/${this.ArgumentString}`);

		if (this.CommandOptions.meadow)
		{
			// Load the meadow schema
			this.log.info(`...Loading meadow schema from relative path [${this.CommandOptions.meadow}]...`)
			try
			{
						this.pict.AppData.meadowSchema = require(libPath.resolve(`${this.fable.AppData.CWD}/${this.CommandOptions.meadow}`));
			}
			catch(pError)
			{
				this.log.error(`Error loading meadow schema: ${pError.message}`);
			}
		}

		this.log.info(`...Creating Documentation Cache Folder...`);

		tmpAnticipate.anticipate(
			(fCallback)=>
			{
				libFilePersistence.makeFolderRecursive(this.fable.AppData.OutputFolderPath, fCallback);
			});

		this.log.info(`Documentation Phase 1: Gathering documentation metainformation....`);
		tmpAnticipate.anticipate(documentationGatherService.gatherDocumentation.bind(documentationGatherService));

		this.log.info(`Documentation Phase 2: Compiling documentation content as data....`);
		tmpAnticipate.anticipate(documentationCompileService.compileDocumentation.bind(documentationCompileService));

		this.log.info(`Documentation Phase 3: Deploying documentation content....`);
		tmpAnticipate.anticipate(documentationDeployService.deployDocumentation.bind(documentationDeployService));

		return fCallback();
	};
}

module.exports = QuackageCommandBuildDocumentation;