const libCommandLineCommand = require('../services/Pict-Service-CommandLineCommand.js');

class QuackageCommandLint extends libCommandLineCommand
{
    constructor(pFable, pManifest, pServiceHash)
    {
        super(pFable, pManifest, pServiceHash);

        this.options.CommandKeyword = 'lint';
        this.options.Description = 'Check your package.json for testing, building and luxury configurations';

        this.fable.TemplateProvider.addTemplate('PrototypePackage', JSON.stringify(this.fable.AppData.QuackagePackage,null,4));

        // Auto add the command on initialization
        this.addCommand();
    }

    run(pOptions, pCommand, fCallback)
    {
        // Execute the command
        this.log.info(`Linting package.json...`);

        // The package.json from the project we are quackin at
        let tmpProjectPackage = this.fable.AppData.Package;
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

                this.log.info(`Checking section [${tmpPackageSectionName}] ... ${tmpPackageSectionExists ? '[exists]' : '[does not exist]'} ... ${tmpSectionsMatch ? '[matches quackage configuration]' : '[does not match quackage configuration]'}`);
                this.log.info(`  --> ${tmpProjectPackage.name}:${tmpProjectPackage.version}/package.json SECTION { ${tmpPackageSectionName}:... }: ${(tmpSectionsMatch && tmpPackageSectionExists) ? '[OK]' : '[NOT OK]'}`);
            }
        }

        console.log('')
        if (!tmpProjectPackage.hasOwnProperty('scripts'))
        {
            this.log.error(`There is something egregiously wrong with ${this.fable.AppData.Package.name}:${this.fable.AppData.Package.version}/package.json ... no scripts object found in root!`);
            this.fable.QuackageProcess.exitParentProcess(1);
        }
        let tmpQuackageScripts = Object.keys(tmpPrototypePackage.PackageScripts);
        for (let i = 0; i < tmpQuackageScripts.length; i++)
        {
            let tmpQuackageScriptKey = tmpQuackageScripts[i];
            let tmpQuackageScriptValue = tmpPrototypePackage.PackageScripts[tmpQuackageScriptKey];

            let tmpScriptExists = tmpProjectPackage.scripts.hasOwnProperty(tmpQuackageScriptKey);
            let tmpScriptMatches = (tmpProjectPackage.scripts[tmpQuackageScriptKey] == tmpQuackageScriptValue);

            let tmpScriptOK = tmpScriptExists && tmpScriptMatches;

//                this.log.info(`Checking script [${tmpQuackageScriptKey}] ... ${tmpScriptExists ? '[exists]' : '[does not exist]'} ... ${tmpScriptMatches ? '[matches quackage script]' : '[does not match quackage script]'}`);
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
            }
        }

        if (typeof(fCallback) == 'function')
        {
            return fCallback();
        }
    };
}

module.exports = QuackageCommandLint;