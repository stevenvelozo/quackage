/**
* Unit tests for Quackage
*
* @author      Steven Velozo <steven@velozo.com>
*/

var libQuackage = require('../source/Quackage-CLIProgram.js');

var Chai = require("chai");
var Expect = Chai.expect;

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
	}
);