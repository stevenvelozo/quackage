const libCommandLineCommand = require('../services/Pict-Service-CommandLineCommand.js');
const libOS = require('os');
const libFS = require('fs');
const libPath = require('path');

class QuackageCommandBuildTemplates extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'buildtemplates';
		this.options.Description = 'Generate boilerplate file set templates for each folder in the passed in path';

		this.options.CommandArguments.push({ Name: '<folder>', Description: 'The folder path to build templates for.' });

		this.options.Aliases.push('bt');

		this.templateSets = {};

		// Auto add the command on initialization
		this.addCommand();
	}

	getTemplateSet(pTemplateSetHash)
	{
		if (!this.templateSets.hasOwnProperty(pTemplateSetHash))
		{
			this.templateSets[pTemplateSetHash] = (
				{
					"Hash": this.defaultServices.DataFormat.cleanNonAlphaCharacters(pTemplateSetHash),
					"Name": this.defaultServices.DataFormat.cleanNonAlphaCharacters(this.defaultServices.DataFormat.capitalizeEachWord(pTemplateSetHash)),
					"Description": `A template set for ${pTemplateSetHash} ...`,
					"Files": []
				});
		}

		return this.templateSets[pTemplateSetHash];
	}

	addTemplateToSet(pTemplateSetHash, pTemplateSetRootPath, pTemplateFilePath, pTemplateFileContent, fCallback)
	{
		let tmpTemplateSet = this.getTemplateSet(pTemplateSetHash);
		let tmpTemplateFilePath = pTemplateFilePath;

		if ((pTemplateSetRootPath.length > 0) && (pTemplateFilePath.length > pTemplateSetRootPath.length))
		{
			tmpTemplateFilePath = pTemplateFilePath.substr(pTemplateSetRootPath.length);
		}
		tmpTemplateFilePath = tmpTemplateFilePath.substr(1);

		tmpTemplateSet.Files.push(
			{
				"Hash": this.defaultServices.DataFormat.cleanNonAlphaCharacters(tmpTemplateFilePath),
				"Path": tmpTemplateFilePath,
				"Content": pTemplateFileContent
			});

		return fCallback();
	}

	generateTemplatesRecursively(pTemplateSet, pTemplateSetRootPath, pPath, fCallback)
	{
		libFS.readdir(pPath,
			(pError, pFiles) =>
			{
				this.fable.Utility.eachLimit(pFiles, 1,
					(pFileName, fEnumerationComplete)=>
					{
						let tmpFilePath = libPath.join(pPath, pFileName);
						let tmpStat = libFS.stat(tmpFilePath,
							(pFileStatError, pFileStats) =>
							{
								if (pFileStatError)
								{
									return fEnumerationComplete('File stat error during enumeration:'+pEnumerationError);
								}

								if (pFileStats && pFileStats.isDirectory())
								{
									return this.generateTemplatesRecursively(pTemplateSet, pTemplateSetRootPath, tmpFilePath, fEnumerationComplete);
								}
								else
								{
									this.log.info(`File [${pFileName}] in [${tmpFilePath}] is being added to template set: ${pTemplateSet}`);
									let tmpFileContent = libFS.readFileSync(tmpFilePath, 'utf8');
									return this.addTemplateToSet(pTemplateSet, pTemplateSetRootPath, tmpFilePath, tmpFileContent, fEnumerationComplete);
								}
							});
					},
					(pEnumerationError) =>
					{
						if (pEnumerationError)
							return fCallback(`Error during bulk catalog of library [${pLibraryName}] folder [${pRelativeFolder}]: ${pEnumerationError}`);
						return fCallback();
					});
			});
	}

	generateTemplatesFromFolder(pPath, fCallback)
	{
		libFS.readdir(pPath,
			(pError, pFiles) =>
			{
				this.fable.Utility.eachLimit(pFiles, 1,
					(pFileName, fEnumerationComplete)=>
					{
						let tmpFilePath = libPath.join(pPath, pFileName);
						let tmpStat = libFS.stat(tmpFilePath,
							(pFileStatError, pFileStats) =>
							{
								if (pFileStatError)
								{
									return fCallback('File stat error during enumeration:'+pEnumerationError);
								}

								let tmpSetName = this.defaultServices.DataFormat.cleanNonAlphaCharacters(pFileName);

								if (pFileStats && pFileStats.isDirectory())
								{
									this.log.info(`Root Directory [${tmpFilePath}] being added as its own template set.`);
									this.generateTemplatesRecursively(tmpSetName, tmpFilePath, tmpFilePath, fEnumerationComplete);
								}
								else
								{
									this.log.info(`Root File [${tmpFilePath}] being added as its own template set.`);
									let tmpFileContent = libFS.readFileSync(tmpFilePath, 'utf8');
									return this.addTemplateToSet(tmpSetName, pPath, tmpFilePath, tmpFileContent, fEnumerationComplete);
								}
							});
					},
					(pEnumerationError) =>
					{
						if (pEnumerationError)
						{
							return fCallback(`Error building templates for ${pPath}: ${pEnumerationError}`, pEnumerationError);
						}
						libFS.writeFileSync(`${this.fable.AppData.CWD}/.quackage-templates.json`, (JSON.stringify(this.templateSets, null, 4)));
						return fCallback();
					});
			});
	}

	run(pPath, pOptions, fCallback)
	{
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback : ()=>{};
		let tmpCWDFolderPath = libPath.resolve(`${this.fable.AppData.CWD}/${pPath}`);
		// Execute the command
		this.log.info(`Creating boilerplate template(s) for [${tmpCWDFolderPath}]...`);

		return this.generateTemplatesFromFolder(tmpCWDFolderPath, tmpCallback);
	};
}

module.exports = QuackageCommandBuildTemplates;