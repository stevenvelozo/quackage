const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');

class QuackageCommandRunNycCoverage extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'run-nyc-coverage';
		this.options.Description = 'Run nyc code coverage with mocha tests.';
		this.options.Aliases.push('coverage');

		this.addCommand();
	}

	findExecutable(pName)
	{
		let tmpCWDLocation = `${this.fable.AppData.CWD}/node_modules/.bin/${pName}`;
		let tmpRelativePackageLocation = `${__dirname}/../../../.bin/${pName}`;
		let tmpGitRepositoryLocation = `${__dirname}/../../node_modules/.bin/${pName}`;

		if (libFS.existsSync(tmpCWDLocation))
		{
			return tmpCWDLocation;
		}
		this.log.info(`CWD Location does not contain an installation of ${pName} at [${tmpCWDLocation}]; checking relative to the quackage package...`);

		if (libFS.existsSync(tmpRelativePackageLocation))
		{
			return tmpRelativePackageLocation;
		}
		this.log.info(`Relative Quackage Package Location does not contain an installation of ${pName} at [${tmpRelativePackageLocation}]; checking if you're running from the direct git repository...`);

		if (libFS.existsSync(tmpGitRepositoryLocation))
		{
			return tmpGitRepositoryLocation;
		}

		return false;
	}

	onRunAsync(fCallback)
	{
		let tmpNycLocation = this.findExecutable('nyc');
		if (!tmpNycLocation)
		{
			let tmpErrorMessage = `Could not find nyc in CWD, relative quackage, or git repository locations.  Maybe you need to run "npm install" somewhere?`;
			this.log.error(tmpErrorMessage);
			return fCallback(new Error(tmpErrorMessage));
		}
		this.log.info(`Quackage found nyc at [${tmpNycLocation}]`);

		let tmpMochaLocation = this.findExecutable('mocha');
		if (!tmpMochaLocation)
		{
			let tmpErrorMessage = `Could not find mocha in CWD, relative quackage, or git repository locations.  Maybe you need to run "npm install" somewhere?`;
			this.log.error(tmpErrorMessage);
			return fCallback(new Error(tmpErrorMessage));
		}
		this.log.info(`Quackage found mocha at [${tmpMochaLocation}]`);

		// nyc --reporter=lcov --reporter=text-lcov MOCHA_PATH -- -u tdd -R spec
		this.fable.QuackageProcess.execute(
			`${tmpNycLocation}`,
			['--reporter=lcov', '--reporter=text-lcov', tmpMochaLocation, '--', '-u', 'tdd', '-R', 'spec'],
			{ cwd: this.fable.AppData.CWD },
			fCallback);
	};
}

module.exports = QuackageCommandRunNycCoverage;
