/*
	Unit tests for {~Data:Record.Scope~} in {~Data:Record.Quackage.AppData.Package.name~} from Quackage Boilerplate
*/

// This is used to grab the source file from the package.json
const _Package = require(`../package.json`);
// Get the "main" view from the package.json
// If you want to test a specific subview, you can delete the above line and change the require below to the specific file.
const libPictView = require(`../${_Package.main}`);

// Mocha, chai and the Expect verb
const Chai = require("chai");
const Expect = Chai.expect;

// This extends node to have the browser environment globals like window and document.
const libBrowserEnv = require('browser-env')
libBrowserEnv();

const libPict = require('pict');

const _MockPictConfiguration = (
{
	Product: 'MockPict-ViewTest',
	ProductVersion: _Package.version
});

// Any view-specific configuration goes here.
// If there is no default_configuration object exported with your view, use an empty JSON object
const _MockPictViewConfiguration = (typeof(libPictView.default_configuration) === 'undefined') ? {} : libPictView.default_configuration;

suite
(
	'{~Data:Record.Quackage.AppData.Package.name~} Pict View Suite',
	function()
	{
		setup
		(
			function()
			{
			}
		);

		suite
		(
			'Low Level',
			function()
			{
				test
				(
					'View Construction',
					function(fDone)
					{
						var testPict = new libPict(_MockPictConfiguration);
						let testView = testPict.addView('TestView', _MockPictViewConfiguration,  libPictView);
						Expect(testView).to.be.an('object');
						Expect(testPict.views.TestView).to.be.an('object');
						Expect(testView.UUID).to.equal(testPict.views.TestView.UUID);
						return fDone();
					}
				);
				test
				(
					'View Initialization',
					function(fDone)
					{
						var testPict = new libPict(_MockPictConfiguration);
						let testView = testPict.addView('TestView', _MockPictViewConfiguration,  libPictView);
						testView.initialize();
						Expect(testView).to.be.an('object');
						Expect(testPict.views.TestView).to.be.an('object');
						Expect(testView.UUID).to.equal(testPict.views.TestView.UUID);
						return fDone();
					}
				);
				test
				(
					'View Initialization (async)',
					function(fDone)
					{
						var testPict = new libPict(_MockPictConfiguration);
						let testView = testPict.addView('TestView', _MockPictViewConfiguration,  libPictView);
						testView.initializeAsync(
							(fCallback) =>
							{
								Expect(testView).to.be.an('object');
								Expect(testPict.views.TestView).to.be.an('object');
								Expect(testView.UUID).to.equal(testPict.views.TestView.UUID);
								return fDone();
							});
					}
				);
			}
		);
	}
);