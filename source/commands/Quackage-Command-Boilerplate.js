const libCommandLineCommand = require('../services/Pict-Service-CommandLineCommand.js');
const libOS = require('os');
const libPath = require('path');

class QuackageCommandLint extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'boilerplate';
		this.options.Description = 'Generate a boilerplate file set <fileset> in your project';

		this.options.CommandArguments.push({ Name: '<fileset>', Description: 'The boilerplate fileset to generate.' });

		this.options.CommandOptions.push({ Name: '-f, --force', Description: 'Force overwrite anything in the package.json; use at your own quacking peril' });
		this.options.CommandOptions.push({ Name: '-c, --content', Description: 'An extra content string.', Default: '' });

		this.options.Aliases.push('boil');
		this.options.Aliases.push('bp');

		this.fable.TemplateProvider.addTemplate('PrototypePackage', JSON.stringify(this.fable.AppData.QuackagePackage, null, 4));

		this.fileSet = require('./Quackage-Command-Boilerplate-Content.json');

		// Auto add the command on initialization
		this.addCommand();
	}

	run(pFileset, pScope, pOptions, fCallback)
	{
		// Execute the command
		this.log.info(`Creating boilerplate file(s) for [${pFileset}] Scoped as ${pScope}...`);

		// Check if there is a .quackage-boilerplate.json in either the current directory or the user's home directory.
		let tmpCWDFilesetPath = `${this.fable.AppData.CWD}/.quackage-boilerplate.json`;
		let tmpHomeFilesetPath = `${libOS.homedir()}/.quackage-boilerplate.json`;

		let libFilePersistence = this.defaultServices.FilePersistence;

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
					this.log.info(`...Merging boilerplate fileset [${tmpCWDFilesetPath}] with [${pFileset}]`);
					this.fileSet = this.defaultServices.Utility.extend(this.fileSet, tmpCWDFileset);
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
					this.log.info(`...Merging boilerplate fileset [${tmpHomeFilesetPath}] with [${pFileset}]`);
					this.fileSet = this.defaultServices.Utility.extend(this.fileSet, tmpHomeFileset);
				}
			}
		}

		// Check if the fileset exists
		if (!this.fileSet[pFileset])
		{
			this.log.error(`The requested fileset [${pFileset}] does not exist!`);
			return fCallback();
		}

		// Build the boilerplate state
		let tmpBoilerPlateRecord = this.fileSet[pFileset];
		tmpBoilerPlateRecord.FileSetName = pFileset;

		tmpBoilerPlateRecord.Scope = pScope;
		tmpBoilerPlateRecord.Content = (typeof(pOptions.content) == 'string') ? pOptions.content : '';
		tmpBoilerPlateRecord.CommandOptions = pOptions;

		// Load each template in the fileset into the template provider
		for (let i = 0; i < tmpBoilerPlateRecord.Files.length; i++)
		{
			let tmpFile = tmpBoilerPlateRecord.Files[i];
			this.fable.TemplateProvider.addTemplate(tmpFile.Hash, tmpFile.Content);
		}
		let tmpTemplateKeys = Object.keys(tmpBoilerPlateRecord.Templates);
		for (let i = 0; i < tmpTemplateKeys.length; i++)
		{
			let tmpTemplateKey = tmpTemplateKeys[i];
			let tmpTemplate = tmpBoilerPlateRecord.Templates[tmpTemplateKey];
			this.fable.TemplateProvider.addTemplate(tmpTemplateKey, tmpTemplate);
		}

		for (let i = 0; i < tmpBoilerPlateRecord.Files.length; i++)
		{
			// Check if each file exists
			let tmpFile = tmpBoilerPlateRecord.Files[i];
			// File paths are templates too!
			let tmpFilePath = libFilePersistence.joinPath(this.fable.parseTemplate(tmpFile.Path, tmpBoilerPlateRecord));

			let tmpFileFolder = libPath.dirname(tmpFilePath);

			libFilePersistence.makeFolderRecursive(tmpFileFolder,
				(pError)=>
				{
					if (pError)
					{
						this.log.error(`Error creating folder [${tmpFileFolder}] for boilerplate scope [${pScope}]: ${pError.message}`);
						return fCallback(pError);
					}

					// Write the file
					if (libFilePersistence.existsSync(tmpFilePath) && !pOptions.force)
					{
						// It exists!  Show the user the command to back it up and/or delete it.  Don't generate it.
						this.log.error(`The requested file [${tmpFilePath}] already exists!`);
						this.log.info(`To back it up, run: [ mv "${tmpFilePath}" "${tmpFilePath}_QuackageBackup_${this.defaultServices.DataGeneration.randomNumericString(4, 9998)}.bak" ]`);
						this.log.info(`To delete it, run:  [ rm "${tmpFilePath}" ]`);
					}
					else
					{
						// It doesn't exist!  Generate it.
						this.log.info(`Writing boilerplate file [${tmpFilePath}]!`);
						// Keep in mind the templates also have access to the package.json and the .quackage.json data in the AppData object.
						libFilePersistence.writeFileSync(tmpFilePath, this.fable.parseTemplate(tmpFile.Content, tmpBoilerPlateRecord));
					}

					if (typeof (fCallback) == 'function')
					{
						return fCallback();
					}

					this.log.info(`Have a nice day!`);
				});

		}
	};
}

module.exports = QuackageCommandLint;