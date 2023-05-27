const libPict = require('pict');

class BaseQuackageProcessExecutionService extends libPict.ServiceProviderBase
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

        this.serviceType = 'QuackageProcess';
    }

    cwd()
    {
        return `ABSTRACT_CWD`;
    }

    quackageFolder()
    {
        return `ABSTRACT_QUACKAGE_FOLDER`;
    }

    exitParentProcess(pCode)
    {
        return 'ABSTRACT_EXIT_PARENT_PROCESS';
    }

	execute(pProcess, pArguments, pOptions, fCallback)
    {
        // Now log out what our execution would be!
        this.log.info(`Executing process: ${pProcess}`);
        this.log.trace(`Full command:  ${pProcess} ${pArguments.join(' ')}`, pOptions);

        return fCallback();
    }
}

module.exports = BaseQuackageProcessExecutionService;