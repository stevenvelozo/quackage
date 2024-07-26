const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class QuackageCommand extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.Description = 'Assemble PICT Form Section JSON Metatemplates';

		this.options.CommandKeyword = 'assemble_pict_form_section_json_metatemplates';
		this.options.Aliases.push('apfsjm');

		this.options.CommandArguments.push({ Name: '<folder>', Description: 'The folder structure of metatemplates to assemble.' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		return fCallback();
	}
}

module.exports = QuackageCommand;
