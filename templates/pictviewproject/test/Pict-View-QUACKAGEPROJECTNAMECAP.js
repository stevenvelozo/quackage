/*
	Unit tests for Pict View: {~PascalCaseIdentifier:AppData.Package.name~}
*/

// This is temporary, but enables unit tests
const libBrowserEnv = require('browser-env')
libBrowserEnv();

const Chai = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

const configureTestPict = (pPict) =>
{
	let tmpPict = (typeof(pPict) == 'undefined') ? new libPict() : pPict;
	tmpPict.TestData = (
		{
			Reads: [],
			Assignments: [],
			Appends: [],
			Gets: []
		});
	tmpPict.ContentAssignment.customReadFunction = (pAddress, pContentType) =>
	{
		tmpPict.TestData.Reads.push(pAddress);
		tmpPict.log.info(`Mocking a read of type ${pContentType} from Address: ${pAddress}`);
		return '';
	}
	tmpPict.ContentAssignment.customGetElementFunction = (pAddress) =>
	{
		tmpPict.TestData.Gets.push(pAddress);
		tmpPict.log.info(`Mocking a get of Address: ${pAddress}`);
		return '';
	}
	tmpPict.ContentAssignment.customAppendElementFunction = (pAddress, pContent) =>
	{
		tmpPict.TestData.Appends.push(pAddress);
		tmpPict.log.info(`Mocking an append of Address: ${pAddress}`, {Content: pContent});
		return '';
	}
	tmpPict.ContentAssignment.customAssignFunction = (pAddress, pContent) =>
	{
		tmpPict.TestData.Assignments.push(pAddress);
		tmpPict.log.info(`Mocking an assignment of Address: ${pAddress}`, {Content: pContent});
		return '';
	}

	return tmpPict;
}

const lib{~PascalCaseIdentifier:AppData.Package.name~} = require(`../{~Data:AppData.Package.main~}`);

suite
(
	'Pict View: {~PascalCaseIdentifier:AppData.Package.name~}',
	() =>
	{
		setup(() => { });

		suite
			(
				'Basic Tests',
				() =>
				{
					test(
							'Object Initialization',
							(fDone) =>
							{
								let _Pict = configureTestPict();
								let _PictView{~PascalCaseIdentifier:AppData.Package.name~} = _Pict.addView({}, 'Pict-View-{~PascalCaseIdentifier:AppData.Package.name~}',  lib{~PascalCaseIdentifier:AppData.Package.name~});
								Expect(_PictView{~PascalCaseIdentifier:AppData.Package.name~}).to.be.an('object');
								return fDone();
							}
						);
				}
			);
	}
);