/*
	Unit tests for {~PascalCaseIdentifier:AppData.Package.name~} {~Data:Record.Scope~}
	{~Data: Record.Description~}
*/

const Chai = require('chai');
const Expect = Chai.expect;

const lib{~PascalCaseIdentifier:AppData.Package.name~} = require(`../{~Data:AppData.Package.main~}`);

suite
(
	'{~PascalCaseIdentifier:AppData.Package.name~} {~Data:Record.Scope~}',
	() =>
	{
		setup(() => { });

		suite
			(
				'Basic {~Data:Record.Scope~} Tests',
				() =>
				{
					test(
							'Generated test {~RandomNumberString:1,9~}',
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