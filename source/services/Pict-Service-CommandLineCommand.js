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
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.serviceType = 'CommandLineCommand';

		this.options = this.defaultServices.Utility.extend(defaultCommandOptions, this.options);
	}

	addCommand()
	{
		if (!this.options.CommandAdded)
		{
			// Find the default CommandLineUtility service, or make one if it isn't there yet
			let tmpCommandLineUtility = this.defaultServices.CommandLineUtility
			if (typeof (tmpCommandLineUtility) === 'undefined')
			{
				tmpCommandLineUtility = this.defaultServices.ServiceManager.instantiateService('CommandLineUtility');
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