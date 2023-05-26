const libFS = require('fs');
const libChildProcess = require('child_process');
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

// Check that a package.json is in the folder we are quacking from
try
{
    _Pict.AppData.Package = require(`${process.cwd()}/package.json`);
}
catch (pError)
{
    _Pict.log.error(`No package.json found in [${process.cwd()}].  Please run quackage from a folder with a package.json file.`);
    _Pict.log.info(`Quack a nice day!`)
    process.exit(1);
}

// Check for a quackage.json file
try
{
    _Pict.AppData.QuackagePackage = require(`${process.cwd()}/.quackage.json`);
    _Pict.AppData.QuackagePackage = _Pict.Utility.extend(_QuackageDefaultConfiguration, _Pict.AppData.QuackagePackage);
}
catch (pError)
{
    _Pict.log.warn(`No quackage.json found in [${process.cwd()}].  Using default configuration.`);
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
        _Pict.TemplateProvider.addTemplate('Gulpfile-Configuration', JSON.stringify(_Pict.AppData.GulpfileConfiguration,null,4));
        _Pict.TemplateProvider.addTemplate('Gulpfile-QuackageBase', _Pict.AppData.QuackagePackage.QuackageBaseGulpfile);

        // ##. Figure out which actions to execute
        for (let i = 0; i < _Pict.AppData.GulpExecutions.length; i++)
        {
            if (tmpActionsToExecute == 'ALL' || tmpActionsToExecute.includes(_Pict.AppData.GulpExecutions[i].Name.toUpperCase()))
            {
                tmpActionSet.push(_Pict.AppData.GulpExecutions[i]);
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
                    if (libFS.existsSync(`${process.cwd()}/.browserslistrc`))
                    {
                        libFS.copyFileSync(`${process.cwd()}/.browserslistrc`, `${process.cwd()}/.browserslistrc-BACKUP`);
                        _Pict.log.info(`Contents of existing .browserslistrc backed up to .browserslistrc and output below:`, {FileContents:libFS.readFileSync(`${process.cwd()}/.browserslistrc`)});
                    }

                    // ## Write out the browserslistrc
                    libFS.writeFileSync(`${process.cwd()}/.browserslistrc`, pAction.BrowsersListRC);
                }

                // ## .babelrc
                if (_Pict.AppData.QuackagePackage.DefaultBabelRC)
                {
                    if (libFS.existsSync(`${process.cwd()}/.babelrc`))
                    {
                        _Pict.log.info(`Leaving the existing .babelrc file in place.  Please make sure it is compatible with the build you are trying to make.`);
                    }
                    else
                    {
                        libFS.writeFileSync(`${process.cwd()}/.babelrc`, JSON.stringify(_Pict.AppData.DefaultBabelRC,null,4));
                    }
                }

                // ## gulpfile-quackage-config.json
                libFS.writeFileSync(`${process.cwd()}/.gulpfile-quackage-config.json`, _Pict.parseTemplateByHash('Gulpfile-Configuration', pAction));
                // ## gulpfile-quackage.js
                libFS.writeFileSync(`${process.cwd()}/.gulpfile-quackage.js`, _Pict.parseTemplateByHash('Gulpfile-QuackageBase', pAction));

                // Now execute the gulpfile!
                const tmpGulpProcess = spawn(`${process.cwd()}/npx gulp --gulpfile ./gulpfile-quackage.js`);

                tmpGulpProcess.stdout.on('data',
                    (pConsoleOutput) =>
                    {
                        _Pict.log.trace(pConsoleOutput);
                    });
                tmpGulpProcess.stderr.on('data',
                    (pConsoleOutput) =>
                    {
                        _Pict.log.error(pConsoleOutput);
                    });

                tmpGulpProcess.stderr.on('error',
                    (pError) =>
                    {
                        _Pict.log.error(`Gulp failed inside your quackage!  Error: ${pError.message}`);
                        return fActionCallback(pError);
                    });

                tmpGulpProcess.stderr.on('close',
                    (pError) =>
                    {
                        _Pict.log.info(`Gulp process completed successfully!`);
                        return fActionCallback(pError);
                    });
            });
        });

_Pict.Command.parse();