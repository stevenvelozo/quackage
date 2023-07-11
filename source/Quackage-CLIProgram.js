const libCLIProgram = require('pict-service-commandlineutility');

let _Pict = new libCLIProgram(
	{
		Product: 'Quackage',
		Version: '0.0.1',

		Command: 'hl-record-downloader',
		Description: 'Download an array of records from Headlight.',

		DefaultProgramConfiguration: require('./Default-Quackage-Configuration.json'),

		// TODO: Should this use a shared config?
		ProgramConfigurationFileName: '.quackage.json',
		AutoGatherProgramConfiguration: true,
		AutoAddConfigurationExplanationCommand: true
	},
	[
		require('./commands/Quackage-Command-UpdatePackage.js'),
		require('./commands/Quackage-Command-Lint.js'),
		require('./commands/Quackage-Command-Build.js'),
		require('./commands/Quackage-Command-Boilerplate.js'),
		require('./commands/Quackage-Command-BuildTemplates.js'),
		require('./commands/Quackage-Command-ListTemplates.js')
	]);

// Instantiate the file persistence service
_Pict.serviceManager.instantiateServiceProvider('FilePersistence');
_Pict.serviceManager.instantiateServiceProvider('DataGeneration');
// Add the Quackage Process Management service
_Pict.serviceManager.addAndInstantiateServiceType('QuackageProcess', require('./services/Quackage-Execute-Process.js'));

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
	_Pict.log.error(`No package.json found in [${_Pict.AppData.CWD}].  Please run quackage from a folder with a package.json file for maximum awesome.`);
	_Pict.log.info(`Loading a default package.json...`);
	_Pict.AppData.Package = require('./Default-Package.json');
}
finally
{
}

module.exports = _Pict;