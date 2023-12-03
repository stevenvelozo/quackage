const libPictView = require('pict-view');

class {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~} extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	// The only thing that should be put in this constructor is internal state initialization (non AppData state)
}

module.exports = {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~};

module.exports.default_configuration =
{
	ViewIdentifier: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}{~PascalCaseIdentifier:Record.Scope~}',
	DefaultRenderable: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}',
	DefaultDestinationAddress: '#BridgeInspectionNavigationContainer',
	Templates:
	[
		{
			Hash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}-Template',
			Template: /*html*/`
<!-- {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~} pict view template: [{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}-Template] -->
<!-- {~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~} end view template:  [{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}-Template] -->
`,
		},
	],
	Renderables:
	[
		{
			RenderableHash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}',
			TemplateHash: '{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}-{~PascalCaseIdentifier:Record.Scope~}-Template',
			DestinationAddress: '#{~PascalCaseIdentifier:Record.Quackage.AppData.Package.name~}_{~PascalCaseIdentifier:Record.Scope~}_Container',
			RenderMethod: 'replace'
		},
	]
};
