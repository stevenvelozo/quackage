const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class QuackageCommand extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.Description = 'Assemble PICT JSON Template HTML Files into a Packaged JS File.';

		this.options.CommandKeyword = 'assemble_pict_json_templates';
		this.options.Aliases.push('apjt');

		this.options.CommandArguments.push({ Name: '<folder>', Description: 'The folder (...structure) of html files to assemble into a template package.' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		return fCallback();
	}
}

module.exports = QuackageCommand;
