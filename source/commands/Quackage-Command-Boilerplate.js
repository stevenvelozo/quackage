const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libOS = require('os');
const libPath = require('path');

class QuackageCommandBoilerplate extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'boilerplate';
		this.options.Description = 'Generate a boilerplate file set <fileset> in your project';

		this.options.CommandArguments.push({ Name: '<fileset>', Description: 'The boilerplate fileset to generate.' });

		this.options.CommandOptions.push({ Name: '-s, --scope [scope]', Description: 'A "scope" for the template (used for things like unit tests)', Default: 'Default' });

		this.options.Aliases.push('boil');
		this.options.Aliases.push('bp');

		try
		{
			this.fileSet = require('../../.quackage-templates.json');
		}
		catch(pError)
		{
			this.fileSet = {};
			this.fable.log.error(`Error loading .quackage-templates.json: ${pError.message}`);
		}

		// Auto add the command on initialization
		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpTemplateFileSet = this.ArgumentString;
		let tmpScope = this.CommandOptions.scope;

		// Execute the command
		this.log.info(`Creating boilerplate file(s) for [${tmpTemplateFileSet}] Scoped as ${tmpScope}...`);

		// Check if there is a .quackage-boilerplate.json in either the current directory or the user's home directory.
		let tmpCWDFilesetPath = `${this.fable.AppData.CWD}/.quackage-templates.json`;
		let tmpHomeFilesetPath = `${libOS.homedir()}/.quackage-templates.json`;

		let libFilePersistence = this.services.FilePersistence;

		if (libFilePersistence.existsSync(tmpCWDFilesetPath))
		{
			this.log.info(`Loading boilerplate fileset found in current directory: ${tmpCWDFilesetPath}`);
			let tmpCWDFileset = false;
			try
			{
				tmpCWDFileset = require(tmpCWDFilesetPath);
			}
			catch (pError)
			{
				this.log.error(`Error require loading boilerplate fileset from [${tmpCWDFilesetPath}]: ${pError.message}`);
			}
			finally
			{
				if (tmpCWDFileset)
				{
					this.log.info(`...Boilerplate fileset loaded from [${tmpCWDFilesetPath}]`);
					this.log.info(`...Merging boilerplate fileset [${tmpCWDFilesetPath}] with [${tmpTemplateFileSet}]`);
					this.fileSet = this.services.Utility.extend(this.fileSet, tmpCWDFileset);
				}
			}
		}

		if (libFilePersistence.existsSync(tmpHomeFilesetPath))
		{
			this.log.info(`Loading boilerplate fileset found in home directory: ${tmpHomeFilesetPath}`);
			let tmpHomeFileset = false;
			try
			{
				tmpHomeFileset = require(tmpHomeFilesetPath);
			}
			catch (pError)
			{
				this.log.error(`Error require loading boilerplate fileset from [${tmpHomeFilesetPath}]: ${pError.message}`);
			}
			finally
			{
				if (tmpHomeFileset)
				{
					this.log.info(`...Boilerplate fileset loaded from [${tmpHomeFilesetPath}]`);
					this.log.info(`...Merging boilerplate fileset [${tmpHomeFilesetPath}] with [${tmpTemplateFileSet}]`);
					this.fileSet = this.services.Utility.extend(this.fileSet, tmpHomeFileset);
				}
			}
		}

		// Check if the fileset exists
		if (!this.fileSet[tmpTemplateFileSet])
		{
			this.log.error(`The requested fileset [${tmpTemplateFileSet}] does not exist!`);
			return fCallback();
		}

		// Build the boilerplate state
		let tmpBoilerPlateRecord = this.fileSet[tmpTemplateFileSet];
		tmpBoilerPlateRecord.FileSetName = tmpTemplateFileSet;

		tmpBoilerPlateRecord.Scope = tmpScope;
		tmpBoilerPlateRecord.Content = (typeof(this.CommandOptions.content) == 'string') ? this.CommandOptions.content : '';
		tmpBoilerPlateRecord.CommandOptions = this.CommandOptions;
		tmpBoilerPlateRecord.Quackage = this;

		// Load each template in the fileset into the template provider
		for (let i = 0; i < tmpBoilerPlateRecord.Files.length; i++)
		{
			let tmpFile = tmpBoilerPlateRecord.Files[i];
			this.fable.TemplateProvider.addTemplate(tmpFile.Hash, tmpFile.Content);
		}
		if (tmpBoilerPlateRecord.hasOwnProperty('Templates'))
		{
			let tmpTemplateKeys = Object.keys(tmpBoilerPlateRecord.Templates);
			for (let i = 0; i < tmpTemplateKeys.length; i++)
			{
				let tmpTemplateKey = tmpTemplateKeys[i];
				let tmpTemplate = tmpBoilerPlateRecord.Templates[tmpTemplateKey];
				this.fable.TemplateProvider.addTemplate(tmpTemplateKey, tmpTemplate);
			}
		}

		this.fable.Utility.eachLimit(tmpBoilerPlateRecord.Files, 1, 
			(pFile, fFolderCallback)=>
			{
				// Check if each file exists
				let tmpFile = pFile;
				// File paths are templates too!
				let tmpFilePath = libFilePersistence.joinPath(this.fable.parseTemplate(tmpFile.Path, tmpBoilerPlateRecord));

				let tmpFileFolder = libPath.dirname(tmpFilePath);

				tmpFilePath = tmpFilePath.replace('QUACKAGEPROJECTNAMECAP', this.services.DataFormat.capitalizeEachWord(this.fable.AppData.Package.name))
											.replace('QUACKAGESCOPE', tmpScope);

				libFilePersistence.makeFolderRecursive(tmpFileFolder,
					(pError)=>
					{
						if (pError)
						{
							this.log.error(`Error creating folder [${tmpFileFolder}] for boilerplate scope [${tmpScope}]: ${pError.message}`);
						}

						if (tmpBoilerPlateRecord.hasOwnProperty('options'))
						{
							tmpBoilerPlateRecord.options = this.CommandOptions;
						}

						// Write the file
						if (libFilePersistence.existsSync(tmpFilePath) && !this.CommandOptions.force)
						{
							// It exists!  Show the user the command to back it up and/or delete it.  Don't generate it.
							this.log.error(`The requested file [${tmpFilePath}] already exists!`);
							this.log.info(`To back it up, run: [ mv "${tmpFilePath}" "${tmpFilePath}_QuackageBackup_${this.services.DataGeneration.randomNumericString(4, 9998)}.bak" ]`);
							this.log.info(`To delete it, run:  [ rm "${tmpFilePath}" ]`);
						}
						else
						{
							// It doesn't exist!  Generate it.
							this.log.info(`Writing boilerplate file [${tmpFilePath}]!`);
							// Keep in mind the templates also have access to the package.json and the .quackage.json data in the AppData object.
							libFilePersistence.writeFileSync(tmpFilePath, this.fable.parseTemplate(tmpFile.Content, tmpBoilerPlateRecord));
						}

						return fFolderCallback();
					});
			},(pError)=>
			{
				return fCallback();
			});

		}
	};


module.exports = QuackageCommandBoilerplate;