const libFS = require('fs');
const libPict = require('pict');
const libCommander = require('commander').Command;

const _QuackagePackage = require('../package.json');
const _QuackageDefaultConfiguration = require('./Default-Quackage-Configuration.json');

let _Pict = new libPict(
    {
        Product: 'Quackage',
        ProductVersion: '1.0.0'
    }
);
_Pict.serviceManager.addAndInstantiateServiceType('QuackageProcess', require('./utility/Quackage-Execute-Process.js'));

// Grab the current working directory for the quackage
_Pict.AppData.CWD = _Pict.QuackageProcess.cwd();
_Pict.AppData.QuackageFolder = _Pict.QuackageProcess.quackageFolder();

// Check that a package.json is in the folder we are quacking from
try
{
    _Pict.AppData.Package = require(`${_Pict.AppData.CWD}/package.json`);
}
catch (pError)
{
    _Pict.log.error(`No package.json found in [${_Pict.AppData.CWD}].  Please run quackage from a folder with a package.json file.`);
    _Pict.log.info(`Quack a nice day!`)
    _Pict.QuackageProcess.exitParentProcess(1);
}
finally
{
    // Check for a quackage.json file
    try
    {
        _Pict.AppData.QuackagePackage = require(`${_Pict.AppData.CWD}/.quackage.json`);
        _Pict.AppData.QuackagePackage = _Pict.Utility.extend(_QuackageDefaultConfiguration, _Pict.AppData.QuackagePackage);
    }
    catch (pError)
    {
        _Pict.log.warn(`No quackage.json found in [${_Pict.AppData.CWD}].  Using default configuration.`);
        _Pict.AppData.QuackagePackage = _QuackageDefaultConfiguration;
    }

    // Use the Commander library to deal with CLI parameters
    _Pict.Command = new libCommander();

    _Pict.Command.name('quackage')
        .description('CLI testing and building meant to be run from a folder with a package.json and customized with a quackage.json')
        .version(_QuackagePackage.version);

    _Pict.Command.command('build')
        .description('Build your npm module into a dist folder')
        .argument('[config]', 'optional hash of the configuration you want to run -- otherwise all are built', "ALL")
        //.option('-s, --separator <char>', 'separator character', ',')
        .action((pString, pOptions) =>
        {
            let tmpActionsToExecute = pString.toUpperCase();
            let tmpActionSet = [];

            _Pict.log.info(`Building your module to ${pString} from the command...`,pOptions);

            // ##. Load the gulp config and code template files into our pict
            _Pict.TemplateProvider.addTemplate('Gulpfile-Configuration', JSON.stringify(_Pict.AppData.QuackagePackage.GulpfileConfiguration,null,4));
            _Pict.TemplateProvider.addTemplate('Gulpfile-QuackageBase', _Pict.AppData.QuackagePackage.QuackageBaseGulpfile);

            // ##. Figure out which actions to execute
            for (let i = 0; i < _Pict.AppData.QuackagePackage.GulpExecutions.length; i++)
            {
                if (tmpActionsToExecute == 'ALL' || tmpActionsToExecute.includes(_Pict.AppData.QuackagePackage.GulpExecutions[i].Name.toUpperCase()))
                {
                    tmpActionSet.push(_Pict.AppData.QuackagePackage.GulpExecutions[i]);
                }
            }

            if (tmpActionSet.length < 1)
            {
                _Pict.log.error(`No actions to execute for the configuration hash [${pString}]`);
                return false;
            }

            // ##. Enumerate the actions, executing each one, in series asynchronously
            _Pict.Utility.eachLimit(
                tmpActionSet, 1,
                (pAction, fActionCallback) =>
                {
                    _Pict.log.info(`Executing action [${pAction.Name}]...`);

                    // ## .browserslistrc
                    if (pAction.hasOwnProperty('BrowsersListRC'))
                    {
                        // ## Backup the .browserslistrc file if it existst
                        if (libFS.existsSync(`${_Pict.AppData.CWD}/.browserslistrc`))
                        {
                            libFS.copyFileSync(`${_Pict.AppData.CWD}/.browserslistrc`, `${_Pict.AppData.CWD}/.browserslistrc-BACKUP`);
                            _Pict.log.info(`Contents of existing .browserslistrc backed up to .browserslistrc-BACKUP and output below:`, {FileContents:libFS.readFileSync(`${_Pict.AppData.CWD}/.browserslistrc`).toString()});
                        }

                        // ## Write out the browserslistrc
                        libFS.writeFileSync(`${_Pict.AppData.CWD}/.browserslistrc`, pAction.BrowsersListRC);
                    }

                    // ## .babelrc
                    if (_Pict.AppData.QuackagePackage.DefaultBabelRC)
                    {
                        if (libFS.existsSync(`${_Pict.AppData.CWD}/.babelrc`))
                        {
                            _Pict.log.info(`Leaving the existing .babelrc file in place.  Please make sure it is compatible with the build you are trying to make.`);
                        }
                        else
                        {
                            libFS.writeFileSync(`${_Pict.AppData.CWD}/.babelrc`, JSON.stringify(_Pict.AppData.QuackagePackage.DefaultBabelRC,null,4));
                        }
                    }

                    // ## gulpfile-quackage-config.json
                    libFS.writeFileSync(`${_Pict.AppData.CWD}/.gulpfile-quackage-config.json`, _Pict.parseTemplateByHash('Gulpfile-Configuration', pAction));
                    // ## gulpfile-quackage.js
                    libFS.writeFileSync(`${_Pict.AppData.CWD}/.gulpfile-quackage.js`, _Pict.parseTemplateByHash('Gulpfile-QuackageBase', {AppData:_Pict.AppData, Record:pAction}));

                    // Now execute the gulpfile using our custom service provider!
                    _Pict.QuackageProcess.execute(`./node_modules/.bin/gulp`, [`--gulpfile`, `${_Pict.AppData.CWD}/.gulpfile-quackage.js`], {cwd:_Pict.AppData.CWD}, fActionCallback);
                });
            });

    _Pict.Command.parse();
}

module.exports = _Pict;