const libQuackageExecuteProcessBase = require(`./Quackage-Execute-Process-Base.js`);
const libChildProcess = require('child_process');
const libPath = require('path');

class BaseQuackageProcessExecutionService extends libQuackageExecuteProcessBase
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

        this.serviceType = 'QuackageProcess';
    }

    cwd()
    {
        return process.cwd();
    }

    quackageFolder()
    {
        return libPath.resolve(`${__dirname}/../..`);
    }

    node_modules_folder()
    {
        return libPath.resolve(`${this.quackagefolder}/..`);
    }

    exitParentProcess(pCode)
    {
        process.exit(pCode);
    }

    execute(pProcess, pArguments, pOptions, fCallback)
    {
        // Now log out what our execution would be!
        this.log.info(`Executing process: ${pProcess}`);
        this.log.trace(`Full command:  ${pProcess} ${pArguments.join(' ')}`, pOptions);

        // Now execute the gulpfile!
        const tmpProcess = libChildProcess.spawn(pProcess, pArguments, pOptions);

        tmpProcess.stdout.on('data',
            (pConsoleOutput) =>
            {
                this.log.trace(pConsoleOutput);
            });
        tmpProcess.stderr.on('data',
            (pConsoleOutput) =>
            {
                this.log.error(pConsoleOutput);
            });

        tmpProcess.stderr.on('error',
            (pError) =>
            {
                this.log.error(`Process execution failed in your quackage manager!  Error: ${pError.message}`);
                return fCallback(pError);
            });

        tmpProcess.stderr.on('close',
            (pError) =>
            {
                this.log.info(`Process completed successfully, with a quack!`);
                return fCallback(pError);
            });
    }
}

module.exports = BaseQuackageProcessExecutionService;