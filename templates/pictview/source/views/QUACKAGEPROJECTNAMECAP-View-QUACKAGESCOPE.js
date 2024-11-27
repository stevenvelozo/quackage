const libPictView = require('pict-view');

_DEFAULT_CONFIGURATION_{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}_{~PascalCaseIdentifier:Record.Scope~} = (
	{
		ViewIdentifier: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~}',

		DefaultRenderable: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}',
		DefaultDestinationAddress: '#{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}_{~PascalCaseIdentifier:Record.Scope~}_Container',
		DefaultTemplateRecordAddress: false,

		// If this is set to true, when the App initializes this will.
		// While the App initializes, initialize will be called.
		AutoInitialize: true,
		AutoInitializeOrdinal: 0,

		// If this is set to true, when the App autorenders (on load) this will.
		// After the App initializes, render will be called.
		AutoRender: true,
		AutoRenderOrdinal: 0,

		AutoSolveWithApp: true,
		AutoSolveOrdinal: 0,

		CSS: false,
		CSSPriority: 500,

		Templates:
		[
			{
				Hash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}-Template',
				Template: /*html*/`
	<!-- {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~} pict view template: [{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}-Template] -->
	<!-- {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~} end view template:  [{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}-Template] -->
	`
			}
		],

		Renderables:
		[
			{
				RenderableHash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}',
				TemplateHash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}-Template',
				DestinationAddress: '#{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}_{~PascalCaseIdentifier:Record.Scope~}_Container',
				RenderMethod: 'replace'
			}
		],

		Manifests: {}
	});

class {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~} extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DEFAULT_CONFIGURATION_{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}_{~PascalCaseIdentifier:Record.Scope~}, pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}
}

module.exports = {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~};

/*
	# Quackage Boilerplate Usage:

	To add this view to the app, add the following code:

	// Require the {~PascalCaseIdentifier:Record.Scope~} view class prototype
	const lib{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~}View = require(`${__dirname}/views/{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-View-{~PascalCaseIdentifier:Record.Scope~}.js`);

	// Add the {~PascalCaseIdentifier:Record.Scope~} view to the pict application
	this.pict.addView('{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~}', {}, lib{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~}View);

	// Profit!
*/

/**************************************
 * {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~} Default View Configuration
 **************************************/
module.exports.default_configuration = _DEFAULT_CONFIGURATION_{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}_{~PascalCaseIdentifier:Record.Scope~};