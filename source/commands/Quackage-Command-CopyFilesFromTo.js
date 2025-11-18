const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');

class QuackageCommandCopyFilesFromTo extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'copy-files-from-to';
		this.options.Description = 'Copy files to a stage location.';

		this.options.Aliases.push('copy');
		this.options.Aliases.push('cp');

		// Auto add the command on initialization
		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		// Execute the command
		this.log.info(`Running copy-files-from-to ...`);

		let tmpCWDCFFTLocation = `${this.fable.AppData.CWD}/node_modules/.bin/copy-files-from-to`;
		let tmpRelativePackageCFFTLocation = `${__dirname}/../../../.bin/copy-files-from-to`;
		let tmpGitRepositoryCFFTLocation = `${__dirname}/../../node_modules/.bin/copy-files-from-to`;
		let tmpCFFTLocation = tmpCWDCFFTLocation;
		// Check that copy-files-from-to exists here
		if (!libFS.existsSync(tmpCFFTLocation))
		{
			this.log.info(`CWD Location does not contain an installation of copy-files-from-to at [${tmpCWDCFFTLocation}]; checking relative to the quackage package...`);
			// Try the folder relative to quackage (wherever this packages' node modules are)
			tmpCFFTLocation = tmpRelativePackageCFFTLocation;
		}
		if (!libFS.existsSync(tmpCFFTLocation))
		{
			this.log.info(`Relative Quackage Package Location does not contain an installation of copy-files-from-to at [${tmpRelativePackageCFFTLocation}]; checking if you're running from the direct git repository...`);
			// Try the folder relative to quackage (wherever this packages' node modules are)
			tmpCFFTLocation = tmpGitRepositoryCFFTLocation;
		}
		if (!libFS.existsSync(tmpCFFTLocation))
		{
			let tmpErrorMessage = `Not even the git checkout location has an installation of copy-files-from-to at [${tmpCFFTLocation}]... building cannot commence.  We also tried CWD [${tmpCWDCFFTLocation}] and relative node_modules [${tmpRelativePackageCFFTLocation}].  Sorry!  Maybe you need to run "npm install" somewhere??`;
			this.log.info(tmpErrorMessage)
			return fActionCallback(new Error(tmpErrorMessage));
		}
		this.log.info(`Quackage found copy-files-from-to at [${tmpCFFTLocation}] ... executing build from there.`);

		// The middle array is for parameters
		// For example: [`--config`, `${this.fable.AppData.CWD}/.quackage-custom-copycommand.cjson`] would be a parameter
		this.fable.QuackageProcess.execute(`${tmpCFFTLocation}`, [], { cwd: this.fable.AppData.CWD }, fCallback);
	};
}

module.exports = QuackageCommandCopyFilesFromTo;