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
				// We are forcing the gulp to run from the node_modules folder of the package -- this allows you to run quackage globally
				let tmpGulpLocation = `${this.fable.AppData.CWD}/node_modules/.bin/gulp`;
				this.fable.QuackageProcess.execute(`${tmpGulpLocation}`, [`--gulpfile`, `${this.fable.AppData.CWD}/.gulpfile-quackage.js`], { cwd: this.fable.AppData.CWD }, fActionCallback);
			},
			(pError) =>
			{
				// Now process the CopyAfterBuild directives
				if (this.pict.ProgramConfiguration.CopyAfterBuild.length > 0)
				{
					//this.log.info(`Copying the following files to :`, { Files: this.pict.ProgramConfiguration.CopyAfterBuild });
					for (let i = 0; i < this.pict.ProgramConfiguration.CopyAfterBuild.length; i++)
					{
						// TODO: FilePersistence needs a copy recursive with globbing.
						//libFS.copyFileSync(`${this.fable.AppData.CWD}/${this.pict.ProgramConfiguration.CopyAfterBuild[i]}`, `${this.fable.AppData.CWD}/dist/${this.pict.ProgramConfiguration.CopyAfterBuild[i]}`);
					}
				}

				return fCallback(pError);
			});
	};
}

module.exports = QuackageCommandBuild;