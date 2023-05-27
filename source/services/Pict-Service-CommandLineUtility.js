const libCommander = require('commander').Command;
const libPict = require('pict');

const defaultCommandLineUtilityOptions = (
    {
        "Command": "default",
        "Description": "Default command",
        "Version": "0.0.0"
    });

class CommandLineUtility extends libPict.ServiceProviderBase
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

        this.serviceType = 'CommandLineUtility';

        // Add the CommandLineCommand service
        this.fable.serviceManager.addServiceType('CommandLineCommand', require('./Pict-Service-CommandLineCommand.js'));

        this.options = this.defaultServices.Utility.extend(defaultCommandLineUtilityOptions, this.options);

        this._Command = new libCommander();

        this._Command.name(this.options.Command)
            .description(this.options.Description)
            .version(this.options.Version);
    }

    createCommand(pCommandName, pCommandDescription)
    {
        return this._Command.command(pCommandName).description(pCommandDescription);
    }

	// Just passing an options will construct one for us.
	// Passing a hash will set the hash.
	// Passing a prototype will use that!
	addCommand(pOptions, pHash, pPrototype)
	{
		let tmpOptions = (typeof(pOptions) == 'object') ? pOptions : {};
		let tmpViewHash = (typeof(pHash) == 'string') ? pHash : this.fable.getUUID();

		if (typeof(pPrototype) != 'undefined')
		{
			return this.fable.serviceManager.instantiateServiceProviderFromPrototype('CommandLineCommand', tmpOptions, tmpViewHash, pPrototype);
		}
		else
		{
			return this.fable.serviceManager.instantiateServiceProvider('CommandLineCommand', tmpOptions, tmpViewHash);
		}
	}

    // Take a prototype command and just add it as a service.
	addCommandFromClass(pPrototype, pHash)
	{
		let tmpHash = (typeof(pHash) == 'string') ? pHash : this.fable.getUUID();
        return this.fable.serviceManager.instantiateServiceProviderFromPrototype('CommandLineCommand', {}, tmpHash, pPrototype);
	}

    run ()
    {
        return this._Command.parse();
    }

    get command()
    {
        return this._Command;
    }
}

module.exports = CommandLineUtility;