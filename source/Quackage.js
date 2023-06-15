const libPict = require('pict');

const _QuackagePackage = require('../package.json');
const _QuackageDefaultConfiguration = require('./Default-Quackage-Configuration.json');


let _Pict = new libPict(
	{
		Product: 'Quackage',
		ProductVersion: '1.0.0'
	}
);
// Instantiate the file persistence service
_Pict.serviceManager.instantiateServiceProvider('FilePersistence');
_Pict.serviceManager.instantiateServiceProvider('DataGeneration');
// Add the Quackage Process Management service
_Pict.serviceManager.addAndInstantiateServiceType('QuackageProcess', require('./services/Quackage-Execute-Process.js'));
// Add the Command Line Utility service
_Pict.serviceManager.addServiceType('CommandLineUtility', require('./services/Pict-Service-CommandLineUtility.js'));

// Grab the current working directory for the quackage
_Pict.AppData.CWD = _Pict.QuackageProcess.cwd();
_Pict.AppData.QuackageFolder = _Pict.QuackageProcess.quackageFolder();

// Check that a package.json is in the folder we are quacking from
try
{
	_Pict.AppData.Package = require(`${_Pict.AppData.CWD}/package.json`);
}
catch (pError)
{
	_Pict.log.error(`No package.json found in [${_Pict.AppData.CWD}].  Please run quackage from a folder with a package.json file.`);
	_Pict.log.info(`Quack a nice day!`)
	_Pict.QuackageProcess.exitParentProcess(1);
}
finally
{
	// Check for a quackage.json file
	try
	{
		_Pict.AppData.QuackagePackage = require(`${_Pict.AppData.CWD}/.quackage.json`);
		_Pict.AppData.QuackagePackage = _Pict.Utility.extend(_QuackageDefaultConfiguration, _Pict.AppData.QuackagePackage);
	}
	catch (pError)
	{
		_Pict.log.warn(`No ./.quackage.json found in [${_Pict.AppData.CWD}].  Using default configuration.`);
		_Pict.AppData.QuackagePackage = _QuackageDefaultConfiguration;
	}

	// Create our command line utility service
	_Pict.serviceManager.instantiateServiceProvider('CommandLineUtility',
		{
			"Command": "quackage",
			"Description": "CLI testing and building meant to be run from a folder with a package.json and customized with a quackage.json",
			"Version": _QuackagePackage.version
		});

	// Add our commands
	_Pict.CommandLineUtility.addCommandFromClass(require('./commands/Quackage-Command-UpdatePackage.js'));
	_Pict.CommandLineUtility.addCommandFromClass(require('./commands/Quackage-Command-Lint.js'));
	_Pict.CommandLineUtility.addCommandFromClass(require('./commands/Quackage-Command-Build.js'));
	_Pict.CommandLineUtility.addCommandFromClass(require('./commands/Quackage-Command-Boilerplate.js'));
	_Pict.CommandLineUtility.addCommandFromClass(require('./commands/Quackage-Command-BuildTemplates.js'));
	_Pict.CommandLineUtility.addCommandFromClass(require('./commands/Quackage-Command-ListTemplates.js'));

	console.log('')
	_Pict.CommandLineUtility.run();
}

module.exports = _Pict;