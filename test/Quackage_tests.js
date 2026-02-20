/**
* Unit tests for Quackage
*
* @author      Steven Velozo <steven@velozo.com>
*/

var libQuackage = require('../source/Quackage-CLIProgram.js');

var libFS = require('fs');
var libPath = require('path');

var Chai = require("chai");
var Expect = Chai.expect;

// Helper to get the list of registered commander command names
var getCommandNames = function()
{
	return libQuackage.CommandLineUtility._Command.commands.map((pCmd) => pCmd.name());
};

// Helper to get a registered commander command by name
var getCommand = function(pName)
{
	return libQuackage.CommandLineUtility._Command.commands.find((pCmd) => pCmd.name() === pName);
};

suite
(
	'Quackage',
	function()
	{
		setup ( () => {} );

		suite
		(
			'Execution Sanity',
			function()
			{
				test
				(
					'Quackage should load up okay.',
					function()
					{
						// How doth the little crocodile automatically test the cli-only utility well?
						let testQuackage = libQuackage;
						Expect(testQuackage.settings.Product).to.equal('Quackage')
					}
				);
			}
		);

		suite
		(
			'All Commands Registration',
			function()
			{
				test
				(
					'All expected commands should be registered in the CLI.',
					function()
					{
						let tmpCommandNames = getCommandNames();

						// explain-config is auto-added by AutoAddConfigurationExplanationCommand
						Expect(tmpCommandNames).to.include('explain-config');

						// Package management
						Expect(tmpCommandNames).to.include('updatepackage');
						Expect(tmpCommandNames).to.include('luxuryupdatepackage');
						Expect(tmpCommandNames).to.include('lint');

						// Testing
						Expect(tmpCommandNames).to.include('run-mocha-tests');

						// Building
						Expect(tmpCommandNames).to.include('build');
						Expect(tmpCommandNames).to.include('copy-files-from-to');

						// Documentation generation
						Expect(tmpCommandNames).to.include('generate-documentation');

						// Templates
						Expect(tmpCommandNames).to.include('assemble_json_views');
						Expect(tmpCommandNames).to.include('boilerplate');
						Expect(tmpCommandNames).to.include('listtemplates');
						Expect(tmpCommandNames).to.include('buildtemplates');

						// Stricture
						Expect(tmpCommandNames).to.include('stricture-compile');
						Expect(tmpCommandNames).to.include('stricture-legaacy');

						// Docuserve / Indoctrinate
						Expect(tmpCommandNames).to.include('indoctrinate');
						Expect(tmpCommandNames).to.include('indoctrinate-index');
						Expect(tmpCommandNames).to.include('docuserve-inject');
						Expect(tmpCommandNames).to.include('prepare-local');
						Expect(tmpCommandNames).to.include('prepare-docs');
						Expect(tmpCommandNames).to.include('docs-serve');

						// HTML example serving
						Expect(tmpCommandNames).to.include('examples-build');
						Expect(tmpCommandNames).to.include('examples-serve');
						Expect(tmpCommandNames).to.include('examples');
					}
				);

				test
				(
					'Commands should have correct aliases.',
					function()
					{
						Expect(getCommand('updatepackage').aliases()).to.include('update_package');

						Expect(getCommand('luxuryupdatepackage').aliases()).to.include('luxury_update_package');
						Expect(getCommand('luxuryupdatepackage').aliases()).to.include('lux');

						Expect(getCommand('run-mocha-tests').aliases()).to.include('test');

						Expect(getCommand('copy-files-from-to').aliases()).to.include('copy');
						Expect(getCommand('copy-files-from-to').aliases()).to.include('cp');

						Expect(getCommand('generate-documentation').aliases()).to.include('dgen');

						Expect(getCommand('assemble_json_views').aliases()).to.include('ajv');

						Expect(getCommand('boilerplate').aliases()).to.include('boil');
						Expect(getCommand('boilerplate').aliases()).to.include('bp');

						Expect(getCommand('listtemplates').aliases()).to.include('list');
						Expect(getCommand('listtemplates').aliases()).to.include('ls');
						Expect(getCommand('listtemplates').aliases()).to.include('lt');

						Expect(getCommand('buildtemplates').aliases()).to.include('bt');

						Expect(getCommand('stricture-compile').aliases()).to.include('scomp');
						Expect(getCommand('stricture-legaacy').aliases()).to.include('str');

						Expect(getCommand('indoctrinate').aliases()).to.include('indoc');

						Expect(getCommand('indoctrinate-index').aliases()).to.include('indoc-index');
						Expect(getCommand('indoctrinate-index').aliases()).to.include('keyword-index');

						Expect(getCommand('docuserve-inject').aliases()).to.include('docuserve');
						Expect(getCommand('docuserve-inject').aliases()).to.include('inject-docs');

						Expect(getCommand('prepare-local').aliases()).to.include('local-docs');
						Expect(getCommand('prepare-local').aliases()).to.include('stage-local');

						Expect(getCommand('prepare-docs').aliases()).to.include('docs');
						Expect(getCommand('prepare-docs').aliases()).to.include('prep-docs');

						Expect(getCommand('docs-serve').aliases()).to.include('serve-docs');
					}
				);
			}
		);

		suite
		(
			'Package Management Commands',
			function()
			{
				test
				(
					'UpdatePackage command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-UpdatePackage.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);

				test
				(
					'UpdatePackage-Luxury command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-UpdatePackage-Luxury.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);

				test
				(
					'Lint command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-Lint.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);
			}
		);

		suite
		(
			'Test Execution Commands',
			function()
			{
				test
				(
					'RunMochaTests command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-RunMochaTests.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);
			}
		);

		suite
		(
			'Build Commands',
			function()
			{
				test
				(
					'Build command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-Build.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);

				test
				(
					'CopyFilesFromTo command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-CopyFilesFromTo.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);
			}
		);

		suite
		(
			'Documentation Generation Commands',
			function()
			{
				test
				(
					'GenerateDocumentation command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-GenerateDocumentation.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.runJSDocCLI).to.be.a('function');
					}
				);
			}
		);

		suite
		(
			'Template Commands',
			function()
			{
				test
				(
					'AssembleJSONViews command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-AssembleJSONViews.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.generateView).to.be.a('function');
						Expect(tmpClass.prototype.addView).to.be.a('function');
						Expect(tmpClass.prototype.generateViewsRecursively).to.be.a('function');
						Expect(tmpClass.prototype.generateViewsFromFolder).to.be.a('function');
					}
				);

				test
				(
					'Boilerplate command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-Boilerplate.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);

				test
				(
					'ListTemplates command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-ListTemplates.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);

				test
				(
					'BuildTemplates command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-BuildTemplates.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.getTemplateSet).to.be.a('function');
						Expect(tmpClass.prototype.addTemplateToSet).to.be.a('function');
						Expect(tmpClass.prototype.generateTemplatesRecursively).to.be.a('function');
						Expect(tmpClass.prototype.generateTemplatesFromFolder).to.be.a('function');
					}
				);
			}
		);

		suite
		(
			'Stricture Commands',
			function()
			{
				test
				(
					'StrictureCompile command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/stricture/Quackage-Command-Stricture-Compile.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);

				test
				(
					'StrictureLegacy command class should require and have onRunAsync.',
					function()
					{
						let tmpClass = require('../source/commands/stricture/Quackage-Command-StrictureLegacy.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
					}
				);
			}
		);

		suite
		(
			'Docuserve and Indoctrinate Commands',
			function()
			{
				test
				(
					'Indoctrinate command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-Indoctrinate.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.resolveExecutable).to.be.a('function');
					}
				);

				test
				(
					'IndoctrinateIndex command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-IndoctrinateIndex.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.resolveExecutable).to.be.a('function');
					}
				);

				test
				(
					'DocuserveInject command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-DocuserveInject.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.resolveExecutable).to.be.a('function');
					}
				);

				test
				(
					'DocuservePrepareLocal command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-DocuservePrepareLocal.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.resolveExecutable).to.be.a('function');
					}
				);

				test
				(
					'PrepareDocs command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-PrepareDocs.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.resolveExecutable).to.be.a('function');
					}
				);

				test
				(
					'DocuserveServe command class should require and have expected methods.',
					function()
					{
						let tmpClass = require('../source/commands/Quackage-Command-DocuserveServe.js');
						Expect(tmpClass).to.be.a('function');
						Expect(tmpClass.prototype.onRunAsync).to.be.a('function');
						Expect(tmpClass.prototype.resolveExecutable).to.be.a('function');
					}
				);
			}
		);

		suite
		(
			'HTML Example Serving Commands',
			function()
			{
				test
				(
					'ExamplesBuild command class should require and have onRunAsync.',
					function()
					{
						let tmpExamplesBuild = require('../source/commands/html_example_serving/Quackage-Command-ExamplesBuild.js');
						Expect(tmpExamplesBuild).to.be.a('function');
						Expect(tmpExamplesBuild.prototype.onRunAsync).to.be.a('function');
					}
				);

				test
				(
					'ExamplesServe command class should require and have onRunAsync.',
					function()
					{
						let tmpExamplesServe = require('../source/commands/html_example_serving/Quackage-Command-ExamplesServe.js');
						Expect(tmpExamplesServe).to.be.a('function');
						Expect(tmpExamplesServe.prototype.onRunAsync).to.be.a('function');
					}
				);

				test
				(
					'Examples combined command class should require and have onRunAsync.',
					function()
					{
						let tmpExamples = require('../source/commands/html_example_serving/Quackage-Command-Examples.js');
						Expect(tmpExamples).to.be.a('function');
						Expect(tmpExamples.prototype.onRunAsync).to.be.a('function');
					}
				);
			}
		);

		suite
		(
			'QuackageExampleService',
			function()
			{
				test
				(
					'QuackageExampleService should be instantiated on the pict instance.',
					function()
					{
						Expect(libQuackage.QuackageExampleService).to.be.an('object');
						Expect(libQuackage.QuackageExampleService.serviceType).to.equal('QuackageExampleService');
					}
				);

				test
				(
					'QuackageExampleService should have expected methods.',
					function()
					{
						let tmpService = libQuackage.QuackageExampleService;
						Expect(tmpService.gatherExampleFolders).to.be.a('function');
						Expect(tmpService.gatherServableExamples).to.be.a('function');
						Expect(tmpService.formatDisplayName).to.be.a('function');
						Expect(tmpService.hashProjectNameToPort).to.be.a('function');
						Expect(tmpService.getMimeType).to.be.a('function');
						Expect(tmpService.generateIndexHTML).to.be.a('function');
						Expect(tmpService.resolveExecutable).to.be.a('function');
						Expect(tmpService.buildExamples).to.be.a('function');
						Expect(tmpService.serveExamples).to.be.a('function');
					}
				);

				test
				(
					'gatherExampleFolders should return empty array for nonexistent path.',
					function()
					{
						let tmpResult = libQuackage.QuackageExampleService.gatherExampleFolders('/nonexistent/path/that/does/not/exist');
						Expect(tmpResult).to.be.an('array');
						Expect(tmpResult).to.have.length(0);
					}
				);

				test
				(
					'gatherServableExamples should return empty array for nonexistent path.',
					function()
					{
						let tmpResult = libQuackage.QuackageExampleService.gatherServableExamples('/nonexistent/path/that/does/not/exist');
						Expect(tmpResult).to.be.an('array');
						Expect(tmpResult).to.have.length(0);
					}
				);

				test
				(
					'hashProjectNameToPort should return a port in the expected range.',
					function()
					{
						let tmpService = libQuackage.QuackageExampleService;

						let tmpPort1 = tmpService.hashProjectNameToPort('pict-section-form');
						Expect(tmpPort1).to.be.at.least(9000);
						Expect(tmpPort1).to.be.at.most(9500);

						let tmpPort2 = tmpService.hashProjectNameToPort('pict-section-objecteditor');
						Expect(tmpPort2).to.be.at.least(9000);
						Expect(tmpPort2).to.be.at.most(9500);

						// Same input should produce same output (deterministic)
						let tmpPort3 = tmpService.hashProjectNameToPort('pict-section-form');
						Expect(tmpPort3).to.equal(tmpPort1);

						// Different inputs should (very likely) produce different ports
						Expect(tmpPort1).to.not.equal(tmpPort2);
					}
				);

				test
				(
					'formatDisplayName should convert folder names to title case.',
					function()
					{
						let tmpService = libQuackage.QuackageExampleService;

						Expect(tmpService.formatDisplayName('simple_form')).to.equal('Simple Form');
						Expect(tmpService.formatDisplayName('complex-table')).to.equal('Complex Table');
						Expect(tmpService.formatDisplayName('debug')).to.equal('Debug');
						Expect(tmpService.formatDisplayName('my_cool-example')).to.equal('My Cool Example');
					}
				);

				test
				(
					'getMimeType should return correct MIME types.',
					function()
					{
						let tmpService = libQuackage.QuackageExampleService;

						Expect(tmpService.getMimeType('.html')).to.equal('text/html');
						Expect(tmpService.getMimeType('.js')).to.equal('text/javascript');
						Expect(tmpService.getMimeType('.css')).to.equal('text/css');
						Expect(tmpService.getMimeType('.json')).to.equal('application/json');
						Expect(tmpService.getMimeType('.png')).to.equal('image/png');
						Expect(tmpService.getMimeType('.svg')).to.equal('image/svg+xml');
						Expect(tmpService.getMimeType('.map')).to.equal('application/json');
						Expect(tmpService.getMimeType('.xyz')).to.equal('application/octet-stream');
					}
				);

				test
				(
					'generateIndexHTML should produce valid HTML with example links.',
					function()
					{
						let tmpService = libQuackage.QuackageExampleService;

						let tmpExamples = [
							{ Name: 'simple_form', DisplayName: 'Simple Form', RelativePath: 'simple_form/dist/index.html', Type: 'example' },
							{ Name: 'debug', DisplayName: 'Debug', RelativePath: 'debug/index.html', Type: 'debug' }
						];

						let tmpHTML = tmpService.generateIndexHTML('test-project', tmpExamples, 9123);

						Expect(tmpHTML).to.be.a('string');
						Expect(tmpHTML).to.include('<!DOCTYPE html>');
						Expect(tmpHTML).to.include('test-project');
						Expect(tmpHTML).to.include('simple_form/dist/index.html');
						Expect(tmpHTML).to.include('Simple Form');
						Expect(tmpHTML).to.include('debug/index.html');
						Expect(tmpHTML).to.include('Debug');
						Expect(tmpHTML).to.include('9123');
						Expect(tmpHTML).to.include('2 example(s) found');
						// Debug example should have the debug badge
						Expect(tmpHTML).to.include('type-badge debug');
					}
				);

				test
				(
					'gatherExampleFolders should find folders with package.json in a temp fixture.',
					function()
					{
						let tmpService = libQuackage.QuackageExampleService;

						// Create a temporary fixture
						let tmpFixtureBase = libPath.join(__dirname, 'tmp_fixture_examples');
						let tmpFixtureAppA = libPath.join(tmpFixtureBase, 'app_a');
						let tmpFixtureAppB = libPath.join(tmpFixtureBase, 'app_b');
						let tmpFixtureNoPackage = libPath.join(tmpFixtureBase, 'no_package');

						libFS.mkdirSync(tmpFixtureAppA, { recursive: true });
						libFS.mkdirSync(tmpFixtureAppB, { recursive: true });
						libFS.mkdirSync(tmpFixtureNoPackage, { recursive: true });

						libFS.writeFileSync(libPath.join(tmpFixtureAppA, 'package.json'), '{"name":"app_a"}');
						libFS.writeFileSync(libPath.join(tmpFixtureAppB, 'package.json'), '{"name":"app_b"}');

						let tmpResult = tmpService.gatherExampleFolders(tmpFixtureBase);
						Expect(tmpResult).to.be.an('array');
						Expect(tmpResult).to.have.length(2);
						Expect(tmpResult.map((pR) => pR.Name)).to.include('app_a');
						Expect(tmpResult.map((pR) => pR.Name)).to.include('app_b');

						// Cleanup
						libFS.unlinkSync(libPath.join(tmpFixtureAppA, 'package.json'));
						libFS.unlinkSync(libPath.join(tmpFixtureAppB, 'package.json'));
						libFS.rmdirSync(tmpFixtureAppA);
						libFS.rmdirSync(tmpFixtureAppB);
						libFS.rmdirSync(tmpFixtureNoPackage);
						libFS.rmdirSync(tmpFixtureBase);
					}
				);

				test
				(
					'gatherServableExamples should find examples with dist/index.html in a temp fixture.',
					function()
					{
						let tmpService = libQuackage.QuackageExampleService;

						// Create a temporary fixture
						let tmpFixtureBase = libPath.join(__dirname, 'tmp_fixture_serve');
						let tmpFixtureDist = libPath.join(tmpFixtureBase, 'my_app', 'dist');
						let tmpFixtureDebug = libPath.join(tmpFixtureBase, 'debug');
						let tmpFixtureEmpty = libPath.join(tmpFixtureBase, 'empty_app');

						libFS.mkdirSync(tmpFixtureDist, { recursive: true });
						libFS.mkdirSync(tmpFixtureDebug, { recursive: true });
						libFS.mkdirSync(tmpFixtureEmpty, { recursive: true });

						libFS.writeFileSync(libPath.join(tmpFixtureDist, 'index.html'), '<html></html>');
						libFS.writeFileSync(libPath.join(tmpFixtureDebug, 'index.html'), '<html></html>');

						let tmpResult = tmpService.gatherServableExamples(tmpFixtureBase);
						Expect(tmpResult).to.be.an('array');
						Expect(tmpResult).to.have.length(2);

						let tmpNames = tmpResult.map((pR) => pR.Name);
						Expect(tmpNames).to.include('my_app');
						Expect(tmpNames).to.include('debug');

						let tmpMyApp = tmpResult.find((pR) => pR.Name === 'my_app');
						Expect(tmpMyApp.RelativePath).to.equal('my_app/dist/index.html');
						Expect(tmpMyApp.Type).to.equal('example');

						let tmpDebug = tmpResult.find((pR) => pR.Name === 'debug');
						Expect(tmpDebug.RelativePath).to.equal('debug/index.html');
						Expect(tmpDebug.Type).to.equal('debug');

						// Cleanup
						libFS.unlinkSync(libPath.join(tmpFixtureDist, 'index.html'));
						libFS.unlinkSync(libPath.join(tmpFixtureDebug, 'index.html'));
						libFS.rmdirSync(tmpFixtureDist);
						libFS.rmdirSync(libPath.join(tmpFixtureBase, 'my_app'));
						libFS.rmdirSync(tmpFixtureDebug);
						libFS.rmdirSync(tmpFixtureEmpty);
						libFS.rmdirSync(tmpFixtureBase);
					}
				);
			}
		);

		suite
		(
			'Default Configuration',
			function()
			{
				test
				(
					'Default configuration should have expected GulpExecutions.',
					function()
					{
						let tmpConfig = require('../source/Default-Quackage-Configuration.json');
						Expect(tmpConfig).to.be.an('object');
						Expect(tmpConfig.GulpExecutions).to.be.an('array');
						Expect(tmpConfig.GulpExecutions.length).to.be.at.least(1);
						Expect(tmpConfig.GulpExecutions[0]).to.have.property('Hash');
						Expect(tmpConfig.GulpExecutions[0]).to.have.property('Name');
						Expect(tmpConfig.GulpExecutions[0]).to.have.property('BuildFileLabel');
						Expect(tmpConfig.GulpExecutions[0]).to.have.property('BrowsersListRC');
					}
				);

				test
				(
					'Default configuration should have GulpfileConfiguration with template placeholders.',
					function()
					{
						let tmpConfig = require('../source/Default-Quackage-Configuration.json');
						Expect(tmpConfig.GulpfileConfiguration).to.be.an('object');
						Expect(tmpConfig.GulpfileConfiguration).to.have.property('EntrypointInputSourceFile');
						Expect(tmpConfig.GulpfileConfiguration).to.have.property('LibraryObjectName');
						Expect(tmpConfig.GulpfileConfiguration).to.have.property('LibraryOutputFolder');
						Expect(tmpConfig.GulpfileConfiguration).to.have.property('LibraryUniminifiedFileName');
						Expect(tmpConfig.GulpfileConfiguration).to.have.property('LibraryMinifiedFileName');
					}
				);

				test
				(
					'Default configuration should have DefaultBabelRC with preset-env.',
					function()
					{
						let tmpConfig = require('../source/Default-Quackage-Configuration.json');
						Expect(tmpConfig.DefaultBabelRC).to.be.an('object');
						Expect(tmpConfig.DefaultBabelRC.presets).to.be.an('array');
						Expect(tmpConfig.DefaultBabelRC.presets).to.include('@babel/preset-env');
					}
				);

				test
				(
					'Default configuration should have PackageScripts.',
					function()
					{
						let tmpConfig = require('../source/Default-Quackage-Configuration.json');
						Expect(tmpConfig.PackageScripts).to.be.an('object');
						Expect(tmpConfig.PackageScripts).to.have.property('test');
						Expect(tmpConfig.PackageScripts).to.have.property('build');
						Expect(tmpConfig.PackageScripts).to.have.property('coverage');
					}
				);

				test
				(
					'Default configuration should have LuxuryPackageScripts.',
					function()
					{
						let tmpConfig = require('../source/Default-Quackage-Configuration.json');
						Expect(tmpConfig.LuxuryPackageScripts).to.be.an('object');
						Expect(tmpConfig.LuxuryPackageScripts).to.have.property('docker-dev-build');
						Expect(tmpConfig.LuxuryPackageScripts).to.have.property('docker-dev-run');
						Expect(tmpConfig.LuxuryPackageScripts).to.have.property('docker-dev-shell');
					}
				);
			}
		);

		suite
		(
			'Services',
			function()
			{
				test
				(
					'QuackageProcess service should be instantiated.',
					function()
					{
						Expect(libQuackage.QuackageProcess).to.be.an('object');
						Expect(libQuackage.QuackageProcess.execute).to.be.a('function');
						Expect(libQuackage.QuackageProcess.cwd).to.be.a('function');
						Expect(libQuackage.QuackageProcess.quackageFolder).to.be.a('function');
					}
				);

				test
				(
					'QuackageProcess.cwd should return a valid directory string.',
					function()
					{
						let tmpCWD = libQuackage.QuackageProcess.cwd();
						Expect(tmpCWD).to.be.a('string');
						Expect(tmpCWD.length).to.be.greaterThan(0);
						Expect(libFS.existsSync(tmpCWD)).to.equal(true);
					}
				);

				test
				(
					'QuackageProcess.quackageFolder should return a valid directory string.',
					function()
					{
						let tmpFolder = libQuackage.QuackageProcess.quackageFolder();
						Expect(tmpFolder).to.be.a('string');
						Expect(tmpFolder.length).to.be.greaterThan(0);
						Expect(libFS.existsSync(tmpFolder)).to.equal(true);
					}
				);

				test
				(
					'FilePersistence service should be instantiated.',
					function()
					{
						Expect(libQuackage.FilePersistence).to.be.an('object');
					}
				);

				test
				(
					'AppData should have CWD and Package loaded.',
					function()
					{
						Expect(libQuackage.AppData).to.be.an('object');
						Expect(libQuackage.AppData.CWD).to.be.a('string');
						Expect(libQuackage.AppData.QuackageFolder).to.be.a('string');
						Expect(libQuackage.AppData.Package).to.be.an('object');
						Expect(libQuackage.AppData.Package.name).to.equal('quackage');
					}
				);
			}
		);

		suite
		(
			'ProgramConfiguration',
			function()
			{
				test
				(
					'ProgramConfiguration should be loaded and have GulpExecutions.',
					function()
					{
						Expect(libQuackage.ProgramConfiguration).to.be.an('object');
						Expect(libQuackage.ProgramConfiguration.GulpExecutions).to.be.an('array');
					}
				);

				test
				(
					'ProgramConfiguration should have GulpfileConfiguration.',
					function()
					{
						Expect(libQuackage.ProgramConfiguration.GulpfileConfiguration).to.be.an('object');
					}
				);
			}
		);
	}
);
