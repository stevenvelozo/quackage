const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');

class QuackageCommandBuild extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'build';
		this.options.Description = 'Build your npm module into a dist folder';

		// Auto add the command on initialization
		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		this.fable.TemplateProvider.addTemplate('Gulpfile-Configuration', JSON.stringify(this.pict.ProgramConfiguration.GulpfileConfiguration, null, 4));
		this.fable.TemplateProvider.addTemplate('Gulpfile-QuackageBase', this.pict.ProgramConfiguration.QuackageBaseGulpfile);

		let tmpActionSet = [];

		this.log.info(`Building browserified and minified versions of your module ...`);

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

		// ##. Enumerate the actions, executing each one, in series asynchronously
		this.fable.Utility.eachLimit(
			tmpActionSet, 1,
			(pAction, fActionCallback) =>
			{
				this.log.info(`###############################[ BUILDING ${pAction.Name} ]###############################`);

				// ## .browserslistrc
				if (pAction.hasOwnProperty('BrowsersListRC'))
				{
					// ## Backup the .browserslistrc file if it existst
					if (libFS.existsSync(`${this.fable.AppData.CWD}/.browserslistrc`))
					{
						libFS.copyFileSync(`${this.fable.AppData.CWD}/.browserslistrc`, `${this.fable.AppData.CWD}/.browserslistrc-BACKUP`);
						this.log.info(`Contents of existing .browserslistrc backed up to .browserslistrc-BACKUP and output below:`, { FileContents: libFS.readFileSync(`${this.fable.AppData.CWD}/.browserslistrc`).toString() });
					}

					// ## Write out the browserslistrc
					libFS.writeFileSync(`${this.fable.AppData.CWD}/.browserslistrc`, pAction.BrowsersListRC);
				}

				// ## .babelrc
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

				// ## .gulpfile-quackage-config.json
				libFS.writeFileSync(`${this.fable.AppData.CWD}/.gulpfile-quackage-config.json`, this.fable.parseTemplateByHash('Gulpfile-Configuration', pAction));
				// ## .gulpfile-quackage.js
				libFS.writeFileSync(`${this.fable.AppData.CWD}/.gulpfile-quackage.js`, this.fable.parseTemplateByHash('Gulpfile-QuackageBase', { AppData: this.fable.AppData, Record: pAction }));
				// ## gulpfile.js
				//libFS.writeFileSync(`${this.fable.AppData.CWD}/gulpfile.js`, this.fable.parseTemplateByHash('Gulpfile-QuackageBase', { AppData: this.fable.AppData, Record: pAction }));

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
					return fActionCallback(new Error(tmpErrorMessage));
				}
				this.log.info(`Quackage found gulp at [${tmpGulpLocation}] ... executing build from there.`);

				this.fable.QuackageProcess.execute(`${tmpGulpLocation}`, [`--gulpfile`, `${this.fable.AppData.CWD}/.gulpfile-quackage.js`], { cwd: this.fable.AppData.CWD }, fActionCallback);
			},
			(pError) =>
			{
				return fCallback(pError);
			});
	};
}

module.exports = QuackageCommandBuild;