const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');
const { spawn } = require('node:child_process');
const {exec} = require("child_process");
const {watch} = require("fs");

class QuackageCommandWatchOld extends libCommandLineCommand
{
    constructor(pFable, pManifest, pServiceHash)
    {
        super(pFable, pManifest, pServiceHash);

        this.logDesignation = 'Quackage Watcher';
        this.reloadCommand = '';
        this.configOverrides;
        this.options.CommandKeyword = 'watch';
        this.options.Description = 'Build your npm module into a dist folder and watch for changes to automatically rebuild';

        // Auto add the command on initialization
        this.addCommand();
    }

    onRunAsync(fCallback)
    {
        this.log.info(`[${this.logDesignation}] Running quackage watcher...`);
        this.fable.TemplateProvider.addTemplate('Gulpfile-Configuration', JSON.stringify(this.pict.ProgramConfiguration.GulpfileConfiguration, null, 4));
        this.fable.TemplateProvider.addTemplate('Gulpfile-QuackageBase', this.pict.ProgramConfiguration.QuackageBaseGulpfile);

        let watchSettings = this.pict.ProgramConfiguration.WatchSettings
        let tmpActionSet = [];

        this.log.info(`Checking for override config at ${process.cwd()}/gulpfile-quackage-config-overrides.json`);
        if (libFS.existsSync(`${process.cwd()}/gulpfile-quackage-config-overrides.json`))
        {
            console.log("Found overrides");
            this.configOverrides = require(`${process.cwd()}/gulpfile-quackage-config-overrides.json`);
            watchSettings = {...watchSettings, ...this.configOverrides.WatchSettings};
        }
        this.log.info(`Config settings are: ${JSON.stringify(watchSettings)}`);



        const directories = watchSettings.MonitorFolders;
        this.reloadCommand = watchSettings.OnFilesChangedCommand;

        // ##. Figure out which actions to execute
        for (let i = 0; i < this.pict.ProgramConfiguration.GulpExecutions.length; i++)
        {
            tmpActionSet.push(this.pict.ProgramConfiguration.GulpExecutions[i]);
        }

        if (tmpActionSet.length < 1)
        {
            this.log.error(`No actions to execute for building -- check your quackage configuration!`);
            return false;
        }

        directories.forEach((dir) => {
            try {
                if (!libFS.existsSync(dir)) {
                    libFS.mkdirSync(dir);
                }
                libFS.watch(dir,{ recursive: true },  (event, filename) => this.reload(event, filename));
            }
            catch (exception) {
                this.log.error(`[${this.logDesignation}]: Error watching ${dir} `, exception.message);
            }
        });

        tmpActionSet.forEach(action => {
            this.setupBabel();
            const browsersListSettings = action.BrowsersListRC;
            let tmpGulpLocation = this.setupGulp(action);
            let buildConfig = {...JSON.parse(this.fable.parseTemplateByHash('Gulpfile-Configuration', action), this.configOverrides?.GulpfileConfiguration)};
            let executionEnvironment = {...process.env};
            executionEnvironment['QuackageBuildConfig'] = JSON.stringify(buildConfig);
            executionEnvironment['BROWSERSLIST'] = browsersListSettings;
            this.fable.QuackageProcess.execute(`${tmpGulpLocation}`, [`--gulpfile`, `${this.fable.AppData.CWD}/.gulpfile-quackage.js`, `watch`],
                { cwd: this.fable.AppData.CWD, env: executionEnvironment }, () => { this.log.info('Completed execution'); });
        });
    };

    reload(event, filename) {
        this.log.info(`[${this.logDesignation}]: File change detected in `, filename);
        exec(this.reloadCommand, (err, stdout, stderr) => {
            if (err) {
                this.log.error(`[${this.logDesignation}]: `);
                this.log.error(`[${this.logDesignation}]: Error:`);
                this.log.error(`[${this.logDesignation}]: ` + err);
                this.log.error(`[${this.logDesignation}]: `);
            }
            this.log.info(`[${this.logDesignation}]: Files rebuilt`);
        });
    }

    setupBabel() {
        if (this.pict.ProgramConfiguration.DefaultBabelRC)
        {
            if (libFS.existsSync(`${this.fable.AppData.CWD}/.babelrc`))
            {
                this.log.info(`Leaving the existing .babelrc file in place.  Please make sure it is compatible with the build you are trying to make.`);
            }
            else
            {
                libFS.writeFileSync(`${this.fable.AppData.CWD}/.babelrc`, JSON.stringify(this.pict.ProgramConfiguration.DefaultBabelRC, null, 4));
            }
        }
    }

    setupGulp(pAction) {
        // ## .gulpfile-quackage.js
        libFS.writeFileSync(`${this.fable.AppData.CWD}/.gulpfile-quackage.js`, this.fable.parseTemplateByHash('Gulpfile-QuackageBase', { AppData: this.fable.AppData, Record: pAction }));
        // Now execute the gulpfile using our custom service provider!
        // We are forcing the gulp to run from the node_modules folder of the package -- this allows you to run quackage globally or from the root of a monorepo
        let tmpCWDGulpLocation = `${this.fable.AppData.CWD}/node_modules/.bin/gulp`;
        let tmpRelativePackageGulpLocation = `${__dirname}/../../../.bin/gulp`;
        let tmpGitRepositoryGulpLocation = `${__dirname}/../../node_modules/.bin/gulp`;
        let tmpGulpLocation = tmpCWDGulpLocation;
        // Check that gulp exists here
        if (!libFS.existsSync(tmpGulpLocation))
        {
            this.log.info(`CWD Location does not contain an installation of gulp at [${tmpCWDGulpLocation}]; checking relative to the quackage package...`);
            // Try the folder relative to quackage (wherever this packages' node modules are)
            tmpGulpLocation = tmpRelativePackageGulpLocation;
        }
        if (!libFS.existsSync(tmpGulpLocation))
        {
            this.log.info(`Relative Quackage Package Location does not contain an installation of gulp at [${tmpRelativePackageGulpLocation}]; checking if you're running from the direct git repository...`);
            // Try the folder relative to quackage (wherever this packages' node modules are)
            tmpGulpLocation = tmpGitRepositoryGulpLocation;
        }
        if (!libFS.existsSync(tmpGulpLocation))
        {
            let tmpErrorMessage = `Not even the git checkout location has an installation of gulp at [${tmpGulpLocation}]... building cannot commence.  We also tried CWD [${tmpCWDGulpLocation}] and relative node_modules [${tmpRelativePackageGulpLocation}].  Sorry!  Maybe you need to run "npm install" somewhere??`;
            this.log.info(tmpErrorMessage)
            return false;
        }
        this.log.info(`Quackage found gulp at [${tmpGulpLocation}] ... executing build from there.`);
        return tmpGulpLocation;
    }
}

module.exports = QuackageCommandWatchOld;