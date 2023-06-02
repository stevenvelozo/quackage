const libPict = require('pict');

const defaultCommandOptions = (
	{
		"CommandKeyword": "default",
		"Description": "Default command",

		"Aliases": [],

		"CommandOptions": [],
		"CommandArguments": []
	});

class CommandLineCommand extends libPict.ServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		// Object.assign is recursive and pollutes middle objects in some environments.  UGH
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultCommandOptions)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'CommandLineCommand';
	}

	addCommand()
	{
		if (!this.options.CommandAdded)
		{
			// Find the default CommandLineUtility service, or make one if it isn't there yet
			let tmpCommandLineUtility = this.services.CommandLineUtility
			if (typeof (tmpCommandLineUtility) === 'undefined')
			{
				tmpCommandLineUtility = this.fable.ServiceManager.instantiateService('CommandLineUtility');
			}

			//_Command.command('command_keyword')
			//  .description('The description of the command_keyword [abc] command')
			// Now add the command
			let tmpCommand = tmpCommandLineUtility.createCommand(this.options.CommandKeyword, this.options.Description);
			//  .alias('conf')
			for (let i = 0; i < this.options.Aliases.length; i++)
			{
				let tmpAlias = this.options.Aliases[i];
				tmpCommand.alias(tmpAlias);
			}


			//  .argument('[config]', 'optional hash of the configuration you want to run -- otherwise all are built', "ALL")
			for (let i = 0; i < this.options.CommandArguments.length; i++)
			{
				let tmpArgument = this.options.CommandArguments[i];
				tmpCommand.argument(tmpArgument.Name, tmpArgument.Description, tmpArgument.Default);
			}
			//  .option('-f, --force', 'force')
			//  .option('-s, --separator <char>', 'separator character', ',')
			for (let i = 0; i < this.options.CommandOptions.length; i++)
			{
				let tmpOption = this.options.CommandOptions[i];
				tmpCommand.option(tmpOption.Name, tmpOption.Description, tmpOption.Default);
			}
			//  .action((pString, pOptions) => { });
			tmpCommand.action(this.run.bind(this));
		}
		else
		{
			this.log.error(`Command ${this.options.CommandKeyword} already added to the command line utility!`);
		}
	}

	run(pArgumentString, pOptions, fCallback)
	{
		// Execute the command
		return fCallback();
	};

}

module.exports = CommandLineCommand;