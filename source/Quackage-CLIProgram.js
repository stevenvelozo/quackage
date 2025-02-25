const libCLIProgram = require('pict-service-commandlineutility');

let _Pict = new libCLIProgram(
	{
		Product: 'Quackage',
		Version: require('../package.json').version,

		Command: 'quackage',
		Description: 'Extensions for managing package.json and make build processes consistent.',

		DefaultProgramConfiguration: require('./Default-Quackage-Configuration.json'),

		// TODO: Should this use a shared config?
		ProgramConfigurationFileName: '.quackage.json',
		AutoGatherProgramConfiguration: true,
		AutoAddConfigurationExplanationCommand: true
	},
	[
		// Management for package.json
		require('./commands/Quackage-Command-UpdatePackage.js'),
		require('./commands/Quackage-Command-UpdatePackage-Luxury.js'),
		require('./commands/Quackage-Command-Lint.js'),

		// Mocha test execution
		require('./commands/Quackage-Command-RunMochaTests.js'),

		// Gulp build execution (for multiple build targets)
		require('./commands/Quackage-Command-Build.js'),
		require('./commands/Quackage-Command-Watch.js'),
		require('./commands/Quackage-Command-CopyFilesFromTo.js'),

		// Build documentation from a folder, with configuration magic if you want
		require('./commands/Quackage-Command-BuildDocumentation.js'),

		// Template handling
		require('./commands/Quackage-Command-AssembleJSONViews.js'),

		// CSV file handling
		require('./commands/Quackage-Command-CSVCheck.js'),
		require('./commands/Quackage-Command-CSVTransform.js'),
		require('./commands/Quackage-Command-CSVIntersect.js'),

		// Boilerplate file management
		require('./commands/Quackage-Command-Boilerplate.js'),
		require('./commands/Quackage-Command-ListTemplates.js'),
		require('./commands/Quackage-Command-BuildTemplates.js')
	]);

// Instantiate the file persistence service
_Pict.instantiateServiceProvider('FilePersistence');
_Pict.instantiateServiceProvider('DataGeneration');
// Add the Quackage Process Management service
_Pict.addAndInstantiateServiceType('QuackageProcess', require('./services/Quackage-Execute-Process.js'));

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
	_Pict.AppData.Package = require('./Default-NpmPackage.json');
}
finally
{
}

module.exports = _Pict;