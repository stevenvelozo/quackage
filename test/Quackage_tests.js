/**
* Unit tests for Quackage
*
* @author      Steven Velozo <steven@velozo.com>
*/

var libQuackage = require('../source/Quackage.js');

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
						let testQuackage = new libQuackage();
						Expect(testQuackage.settings.Product).to.equal('ApplicationNameHere')
					}
				);
			}
		);
	}
);