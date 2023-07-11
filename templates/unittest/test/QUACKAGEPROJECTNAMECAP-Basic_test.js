/*
	Unit tests for {~PascalCaseIdentifier:AppData.Package.name~} v.{~D:AppData.Package.version~} {~Data:Record.Scope~}
*/

const Chai = require('chai');
const Expect = Chai.expect;

const lib{~PascalCaseIdentifier:AppData.Package.name~} = require(`../{~Data:AppData.Package.main~}`);

suite
(
	'{~PascalCaseIdentifier:AppData.Package.name~} {~Data:Record.Scope~} Suite',
	() =>
	{
		setup(() => { });

		suite
			(
				'Basic {~D:_Package.name~}.v.{~D:_Package.version~} {~D:Record.Scope~} Tests',
				() =>
				{
					test(
							'Object Instantiation',
							(fDone) =>
							{
								let _{~PascalCaseIdentifier:AppData.Package.name~} = new lib{~PascalCaseIdentifier:AppData.Package.name~}();
								Expect(_{~PascalCaseIdentifier:AppData.Package.name~}).to.be.an('object');
								return fDone();
							}
						);
				}
			);
	}
);