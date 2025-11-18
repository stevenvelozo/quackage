const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');

class QuackageCommandUpdatePackage extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'updatepackage';
		this.options.Description = 'Update your package.json to support streamlined testing, building and coverage';
		this.options.Aliases.push('update_package');

		this.fable.TemplateProvider.addTemplate('PrototypePackage', JSON.stringify(this.pict.ProgramConfiguration, null, 4));

		this.options.CommandOptions.push({ Name: '-f, --force', Description: 'Force overwrite anything in the package.json; use at your own quacking peril' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		// Execute the command
		this.log.info(`Updating package.json...`);

		let tmpOptions = this.CommandOptions;

		// The package.json from the project we are quackin at
		let tmpProjectPackage = JSON.parse(JSON.stringify(this.fable.AppData.Package));
		let tmpPrototypePackage = JSON.parse(this.fable.parseTemplateByHash('PrototypePackage'));

		console.log('')
		let tmpQuackageConfigSections = Object.keys(tmpPrototypePackage);
		for (let i = 0; i < tmpQuackageConfigSections.length; i++)
		{
			let tmpQuackageConfigSection = tmpQuackageConfigSections[i];
			let tmpQuackageConfigSectionValue = tmpPrototypePackage[tmpQuackageConfigSection];

			if (this.fable.DataFormat.stringStartsWith(tmpQuackageConfigSection, 'PackageSection-'))
			{
				// Get the package section name
				let tmpPackageSectionName = tmpQuackageConfigSection.replace('PackageSection-', '');
				let tmpPackageSectionExists = tmpProjectPackage.hasOwnProperty(tmpPackageSectionName);
				let tmpSectionsMatch = (JSON.stringify(tmpProjectPackage[tmpPackageSectionName]) == JSON.stringify(tmpQuackageConfigSectionValue));

				if (!tmpPackageSectionExists || tmpOptions.force)
				{
					this.log.info(`  --> ${tmpProjectPackage.name}:${tmpProjectPackage.version}/package.json SECTION { ${tmpPackageSectionName}:... }: ${(tmpSectionsMatch && tmpPackageSectionExists) ? '[OK]' : '[NOT OK]'}`);
					tmpProjectPackage[tmpPackageSectionName] = tmpQuackageConfigSectionValue;
				}
			}
		}

		console.log('')
		if (!tmpProjectPackage.hasOwnProperty('scripts'))
		{
			this.log.error(`There is something egregiously wrong with ${this.fable.AppData.Package.name}:${this.fable.AppData.Package.version}/package.json ... no scripts object found in root.  I will add it...`);
			tmpProjectPackage.scripts = {};
		}
		let tmpQuackageScripts = Object.keys(tmpPrototypePackage.PackageScripts);
		for (let i = 0; i < tmpQuackageScripts.length; i++)
		{
			let tmpQuackageScriptKey = tmpQuackageScripts[i];
			let tmpQuackageScriptValue = tmpPrototypePackage.PackageScripts[tmpQuackageScriptKey];

			let tmpScriptExists = tmpProjectPackage.scripts.hasOwnProperty(tmpQuackageScriptKey);
			let tmpScriptMatches = (tmpProjectPackage.scripts[tmpQuackageScriptKey] == tmpQuackageScriptValue);

			let tmpScriptOK = tmpScriptExists && tmpScriptMatches;

			this.log.info(`  --> ${this.fable.AppData.Package.name}:${this.fable.AppData.Package.version}/package.json SCRIPT { scripts.${tmpQuackageScriptKey} }: ${tmpScriptOK ? '[OK]' : '[NOT OK]'}`);
			if (!tmpScriptOK)
			{
				if (tmpScriptExists)
				{
					this.log.info(`    > Current Script:  [${tmpProjectPackage.scripts[tmpQuackageScriptKey]}]`);
				}
				if (!tmpScriptMatches || !tmpScriptExists)
				{
					this.log.info(`    > Quackage Script: [${tmpQuackageScriptValue}]`);
				}
				if (!tmpScriptExists || tmpOptions.force)
				{
					this.log.info(`    > ${tmpScriptExists ? 'Updating' : 'Adding'} script [${tmpQuackageScriptKey}] ...`);
					tmpProjectPackage.scripts[tmpQuackageScriptKey] = tmpQuackageScriptValue;
				}
			}
		}

		// Backing up the project package
		this.log.info(`Backing up ${this.fable.AppData.CWD}/package.json to ${this.fable.AppData.CWD}/.package.json.quackage.bak ...`);
		libFS.writeFileSync(`${this.fable.AppData.CWD}/.package.json.quackage.bak`, JSON.stringify(this.fable.AppData.Package, null, 4));
		this.log.info(`Writing ${this.fable.AppData.CWD}/package.json ...`);
		libFS.writeFileSync(`${this.fable.AppData.CWD}/package.json`, JSON.stringify(tmpProjectPackage, null, 4));

		return fCallback();
	};
}

module.exports = QuackageCommandUpdatePackage;