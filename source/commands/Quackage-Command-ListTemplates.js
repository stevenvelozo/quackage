const libCommandLineCommand = require('../services/Pict-Service-CommandLineCommand.js');
const libOS = require('os');
const libPath = require('path');

class QuackageCommandBoilerplate extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'listtemplates';
		this.options.Description = 'List the available boilerplate template filesets in your user, local and the built-in .quackage-templates.json file(s).';

		this.options.Aliases.push('list');
		this.options.Aliases.push('lt');

		this.fable.TemplateProvider.addTemplate('PrototypePackage', JSON.stringify(this.fable.AppData.QuackagePackage, null, 4));

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

	run(pFileset, pOptions, fCallback)
	{
		let tmpScope = pOptions.scope;
		// Execute the command
		this.log.info(`Creating boilerplate file(s) for [${pFileset}] Scoped as ${tmpScope}...`);

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
					this.log.info(`...Merging boilerplate fileset [${tmpCWDFilesetPath}] with [${pFileset}]`);
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
					this.log.info(`...Merging boilerplate fileset [${tmpHomeFilesetPath}] with [${pFileset}]`);
					this.fileSet = this.services.Utility.extend(this.fileSet, tmpHomeFileset);
				}
			}
		}

		let tmpFileSetKeys = Object.keys(this.fileSet);

		if (tmpFileSetKeys.length === 0)
		{
			this.log.info(`No boilerplate template filesets found, which is odd because Quackage should have some built-in..`);
		}

		for (let i = 0; i < tmpFileSetKeys.length; i++)
		{
			let tmpFileSetFileCount = this.fileSet[tmpFileSetKeys[i]].hasOwnProperty('Files') ? this.fileSet[tmpFileSetKeys[i]].Files.length : 0;
			this.log.info(`${this.fable.DataFormat.stringPadEnd(tmpFileSetKeys[i], 40, ' _')} (${tmpFileSetFileCount} templated files)`);
		}

		if (typeof(fCallback) === 'function')
		{
			return fCallback();
		}
	};
}

module.exports = QuackageCommandBoilerplate;