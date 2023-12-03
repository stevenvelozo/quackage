const libPictView = require('pict-view');

class {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~} extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~};


/**************************************
 *      Default View Configuration     *
 **************************************/
module.exports.default_configuration =
{
	ViewIdentifier: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}',

	DefaultRenderable: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}',
	DefaultDestinationAddress: '#{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}_Container',
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
			Hash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-Template',
			Template: /*html*/`
<!-- {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~} pict view template: [{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-Template] -->
<!-- {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~} end view template:  [{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-Template] -->
`,
		},
	],

	Renderables:
	[
		{
			RenderableHash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}',
			TemplateHash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-Template',
			DestinationAddress: '#{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}_Container',
			RenderMethod: 'replace'
		},
	],

	Manifests: {}
};
