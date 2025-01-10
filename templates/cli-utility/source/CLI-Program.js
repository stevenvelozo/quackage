const libCLIProgram = require('pict-service-commandlineutility');
const _PackageJSON = require('../package.json');

/**
 * This object is the `pict` and `fable` settings for the program.
 * 
 * The object is exposed in commands as the `this.fable.settings` object.
 */
const _ProgramPictSettings = (
	{
		Product: 'NoOp-CLI',
		Description: 'Do absolutely nothing.',

		// This is the command that will be used to run the program from the command line.
		// Not necessary but nice to have inside the different commands.
		Command: 'run_my_program',
		Version: _PackageJSON.version,

		// This is the `fable-log` logstreams configuration.
		LogStreams:
			[
				/* You can uncomment this to have a log file output. */
				{
					loggertype:'simpleflatfile',
					outputloglinestoconsole: false,
					showtimestamps: true,
					formattedtimestamps: true,
					level:'trace',
					path: `${process.cwd()}/NoOp-CLI-Run-${libCLIProgram.generateFileNameDateStamp()}.log`
				},
				{
					loggertype:'console',
					showtimestamps: true,
					formattedtimestamps: true,
					level: 'trace'
				}
			],

		// This is the filename for the program options file.
		// 
		// Options files are read from:
		// 1. The current directory.
		// 2. The user's home directory.
		// 3. This configuration (DefaultProgramOptions)
		//
		// These options files are wonderful for managing credentials when you
		// don't want to hard-code them into your program and want multiple
		// tools to share the same configuration.
		//
		// The file is a JSON file.
		//
		// These options are exposed in commands as the `this.options` object.
		ProgramOptionsFileName: '.myprogram.config.json',

		// This tells the utility to automatically try to coalesce the Options
		// files in the order above.
		AutoGatherProgramOptions: true,
		// This adds an explanation command so users can see what the Options
		// coalesced to.
		AutoAddConfigurationExplanationCommand: true,

		// These are the default options listed as fallback 3 above
		DefaultProgramOptions:
			{
				Some_Configuration_Value: "ALWAYS"
			},

		// This is exposed for convenience to the developer.
		PackageJSON: _PackageJSON
	});

// Instantiate an instance of the pict CLI program.  Includes commander, pict
// and fable ready to go.
let _Program = new libCLIProgram(_ProgramPictSettings,
// This is an array of pict CLICommandLineCommands.
// Class: require('pict-service-commandlineutility').ServiceCommandLineCommand
	[
		require('./CLI-Command-SomeCommand.js')
	]);

module.exports = _Program;