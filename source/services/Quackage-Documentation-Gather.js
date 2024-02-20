const libPict = require('pict');
const libFS = require('fs');
const libPath = require('path');

class DocumentationGather extends libPict.ServiceProviderBase
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.serviceType = 'DocumentationGather';

		this.pathsToScan = [];

		this.fileFormats = (
			{
				".md": "Markdown",
				".markdown": "Markdown",
				".txt": "Markdown"
			});

		this.ignoredFileNames = ["node_modules", ".git", ".DS_Store"];
	}

	createContentDescriptionFromFile(pFilePath)
	{
		if ((typeof(pFilePath) !== 'string') || (pFilePath.length < 1))
		{
			return false;
		}

		let tmpFileLocation = libPath.dirname(pFilePath);
		let tmpFileName = libPath.basename(pFilePath);

		let tmpFileFormat = libPath.extname(pFilePath);

		// This is used to create the hash for the file name
		// For instance if the file is "Employee.md" the hash is "Employee"
		let tmpContentHash = libPath.basename(pFilePath, tmpFileFormat);

		// Now get labels from the file path
		let tmpFileLabels = tmpFileLocation.split(libPath.sep);

		// Get a content description object
		return (
			{
				"UUID": this.fable.getUUID(),

				// It is important to note that record hashes are NOT UNIQUE
				"Hash": tmpContentHash,

				"FilePath": pFilePath,

				"FileLocation": tmpFileLocation,
				"FileName": tmpFileName,

				"FileFormat": tmpFileFormat,

				"Content": "",

				"Labels": tmpFileLabels
			});
	}

	gatherFilesRecursively(pRootPath, pPath, fCallback)
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


								if (this.ignoredFileNames.indexOf(pFileName) > -1)
								{
									// This is one of the ignored files; skip it and its children if it is a folder.
									return fEnumerationComplete();
								}
								else if (pFileStats && pFileStats.isDirectory())
								{
									return this.gatherFilesRecursively(pRootPath, tmpFilePath, fEnumerationComplete);
								}
								else
								{
									let tmpFileFormat = libPath.extname(tmpFilePath);
									
									if (this.fileFormats.hasOwnProperty(tmpFileFormat))
									{
										// This is a known documentation format -- bring it in.
										this.log.info(`File [${pFileName}] in [${tmpFilePath}] is being added to documentation content set.`);
										let tmpContentDescription = this.createContentDescriptionFromFile(tmpFilePath);

										if (tmpContentDescription)
										{
											// Load the content
											tmpContentDescription.Content = libFS.readFileSync(tmpFilePath, 'utf8');
											tmpContentDescription.RootPath = pRootPath;
											this.fable.AppData.contentSet.push(tmpContentDescription);
										}
										return fEnumerationComplete();
									}
									else
									{
										// This is not a known documentation format -- skip it.
										return fEnumerationComplete();
									}
								}
							});
					},
					(pEnumerationError) =>
					{
						if (pEnumerationError)
						{
							return fCallback(`Error during recursive content file scan in folder [${pPath}]: ${pEnumerationError}`);
						}
						return fCallback();
					});
			});
	}

	gatherDocumentation(fCallback)
	{
		this.log.info('...Gathering Potential Files for Documentation Compilation...');

		this.fable.AppData.contentSet = [];

		let tmpAnticipate = this.fable.newAnticipate();

		this.pathsToScan.forEach(
			(pPath) =>
			{
				tmpAnticipate.anticipate(
					(fScanComplete)=>
					{
						return this.gatherFilesRecursively(pPath, pPath, fScanComplete);
					});
			});
		
		tmpAnticipate.wait(
			(pError)=>
			{
				this.log.info(`...Gather Complete (found ${this.fable.AppData.contentSet.length} pieces of content).`);
				return fCallback(pError);
			});
	}
}

module.exports = DocumentationGather;