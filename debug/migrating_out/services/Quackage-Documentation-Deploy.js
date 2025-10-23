const libPict = require('pict');

class DocumentationDeploy extends libPict.ServiceProviderBase
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.serviceType = 'DocumentationDeploy';
	}

	deployDocumentation(fCallback)
	{
		this.log.info('...Deploying documentation...')
		let libFilePersistence = this.services.FilePersistence;

		// TODO: Config for this file name?
		let tmpFullDocumentationFileName = `${this.fable.AppData.OutputFolderPath}/full_compiled_documentation.json`;
		this.log.info(`Writing full documentation JSON to [${tmpFullDocumentationFileName}]...`);
		libFilePersistence.writeFileSync(tmpFullDocumentationFileName, JSON.stringify(this.fable.AppData.DocumentationOutput,null,4));

		let tmpFullLaTeXDocumentationFileName = `${this.fable.AppData.OutputFolderPath}/full_compiled_documentation.tex`;
		this.log.info(`Writing full LaTeX documentation to [${tmpFullLaTeXDocumentationFileName}]...`);
		let tmpFullLaTeX = '';
		for (let i = 0; i < this.fable.AppData.DocumentationOutput.Parts.length; i++)
		{
			let tmpPart = this.fable.AppData.DocumentationOutput.Parts[i];

			tmpFullLaTeX += tmpPart.LaTeX_Content+"\n";
		}
		libFilePersistence.writeFileSync(tmpFullLaTeXDocumentationFileName, tmpFullLaTeX);

		return fCallback();
	}
}

module.exports = DocumentationDeploy;