const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libFS = require('fs');
const libPath = require('path');

class QuackageCommandBuildTemplates extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'generate_json_views';
		this.options.Description = 'Generate PICT JSON View Configurations';

		this.options.CommandArguments.push({ Name: '<folder>', Description: 'The folder path to build views in.' });

		this.options.CommandOptions.push({ Name: '-p, --prefix [prefix]', Description: 'A "prefix" for the view set identifiers', Default: 'Default' });

		this.options.Aliases.push('gjv');

		this.viewSets = {};

		this.addCommand();
	}

	/**
	 * Generate a JSON-only pict view.
	 * 
	 * @param {string} pViewPrefix - The prefix for this set of files and views.
	 * @param {*} pViewName - The name of the view.
	 * @param {*} pViewContent - The HTML content of the view.
	 */
	generateView(pViewPrefix, pViewName, pViewContent)
	{
		let tmpViewNameClean = this.services.DataFormat.cleanNonAlphaCharacters(pViewName)
		let tmpView = (
			{
				"ViewIdentifier": `${pViewPrefix}-${tmpViewNameClean}-View`,

				"DefaultRenderable": `${pViewPrefix}-${tmpViewNameClean}-Renderable`,
				"DefaultDestinationAddress": `#${pViewPrefix}-Content-Container`,

				"AutoRender": false,

				"Templates": [
					{
						"Hash": `${pViewPrefix}-${tmpViewNameClean}-Content-Template`,
						"Template": pViewContent
					}
				],
				"Renderables": [
					{
						"RenderableHash": `${pViewPrefix}-${tmpViewNameClean}-Renderable`,
						"TemplateHash": `${pViewPrefix}-${tmpViewNameClean}-Content-Template`
					}
				]
			});
		return tmpView;
	}

	addView(pViewPrefix, pViewRootPath, pViewFilePath)
	{
		// Load the view file
		let tmpViewFileContent = libFS.readFileSync(pViewFilePath, 'utf8');
		let tmpViewFileName = libPath.basename(pViewFilePath);
		let tmpViewName = this.fable.DataFormat.cleanNonAlphaCharacters(this.fable.DataFormat.capitalizeEachWord(tmpViewFileName));

		// Generate a view json
		let tmpViewJSON = this.generateView(pViewPrefix, tmpViewName, tmpViewFileContent);
		tmpViewJSON.CommentOriginalFilePath = pViewFilePath;
		tmpViewJSON.CommentOriginalRootPath = pViewRootPath;
		// Right now the view JSON will have the file extension in it of the template file.  I kindof like this.
		this.viewSets[tmpViewJSON.ViewIdentifier] = tmpViewJSON;
	}

	generateViewsRecursively(pViewPrefix, pRootPath, pPath, fCallback)
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
									return this.generateViewsRecursively(pViewPrefix, pRootPath, tmpFilePath, fEnumerationComplete);
								}
								else
								{
									this.log.info(`Generating View JSON for ${pViewPrefix} from File [${pFileName}] in [${tmpFilePath}]`);
									this.addView(pViewPrefix, pPath, tmpFilePath);
									return fEnumerationComplete();
								}
							});
					},
					(pEnumerationError) =>
					{
						if (pEnumerationError)
						{
							return fCallback(`Error during recursive view JSON generation in folder [${pPath}]: ${pEnumerationError}`);
						}
						return fCallback();
					});
			});
	}

	generateViewsFromFolder(pViewPrefix, pPath, fCallback)
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

								if (pFileStats && pFileStats.isDirectory())
								{
									this.generateViewsRecursively(pViewPrefix, pPath, tmpFilePath, fEnumerationComplete);
								}
								else
								{
									this.addView(pViewPrefix, pPath, tmpFilePath);
									return fEnumerationComplete();
								}
							});
					},
					(pEnumerationError) =>
					{
						if (pEnumerationError)
						{
							return fCallback(`Error building configuration only pict views for ${pPath}: ${pEnumerationError}`, pEnumerationError);
						}
						libFS.writeFileSync(`${this.fable.AppData.CWD}/${pViewPrefix}-View-Templates.json`, (JSON.stringify(this.viewSets, null, 4)));
						return fCallback();
					});
			});
	}

	onRunAsync(fCallback)
	{
		let tmpPath = this.ArgumentString;
		let tmpViewPrefix = this.CommandOptions.prefix;
		let tmpCWDFolderPath = libPath.resolve(`${this.fable.AppData.CWD}/${tmpPath}`);
		return this.generateViewsFromFolder(tmpViewPrefix, tmpCWDFolderPath, fCallback);
	};
}

module.exports = QuackageCommandBuildTemplates;