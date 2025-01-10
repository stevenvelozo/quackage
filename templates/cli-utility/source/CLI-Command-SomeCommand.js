const libCLICommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class PushComprehensionsViaIntegration extends libCLICommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// This is the command keyword that will be used to execute this command.
		//
		// For this example command, you would run `npx run_my_program do_something`
		this.options.CommandKeyword = 'do_something';
		this.options.Description = 'Describe here what your command does.';

		// This is a shorthand alias for the command.  Make as many as you want!
		this.options.Aliases.push('do');

		// This is a command Argument -- a required string after the command.
		//
		// So for instance if you needed an input filename for this command to
		// function properly, you could call it `input_file_name_` here and
		// within the command below, it will be in `this.ArgumentString`.
		this.options.CommandArguments.push({ Name: '<input_file_name>', Description: 'The file to load.' });

		// Add the command to the program.  This makes it executable by the
		// wrapping program.
		this.addCommand();
	}

	/**
	 * Execute whatever is in the command.
	 * 
	 * This function is not strictly necessary but is an easier pattern to
	 * maintain because we can run this from a test harness without using
	 * any of the `commander.js` comand-line-utility library stuff.
	 * 
	 * You can call this anything you want (or delete it).
	 * 
	 * @param {function} fCallback
	 * 
	 * @returns void
	 */
	doSomethingAsyncronous(fCallback)
	{
		let tmpInputFile = this.ArgumentString;

		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate(
			(fCallback) =>
			{
				this.fable.log.info(`Preparing the command to run...`);
				return fCallback();
			});

		tmpAnticipate.anticipate(
			(fCallback) =>
			{
				try
				{
					this.fable.log.info(`...running the command on the input file [${this.ArgumentString}]...`);
					// Put some kind of code here to do something.
					return fCallback();
				}
				catch(pError)
				{
					this.fable.log.error(`Error running the command: ${pError}`, pError);
					return fCallback(pError);
				}
			});

		tmpAnticipate.anticipate(
			(fCallback) =>
			{
				this.fable.log.info(`...cleaning up after the command...`);
				// We should always clean up after ourselves
				return fCallback();
			});

		tmpAnticipate.wait(
			(pError) =>
			{
				if (pError)
				{
					this.fable.log.error(`Execution error running the command: ${pError}`, pError);
					return fCallback(pError);
				}
				this.fable.log.info(`...fiinished running the command.`);
				this.fable.log.info(`Have a nice day!`);
				return fCallback(pError);
			});
	}

	/**
	 * The overloaded command function from the `pict-service-commandlineutility` class.
	 * 
	 * @param {function} fCallback 
	 * @returns void
	 */
	onRunAsync(fCallback)
	{
		return this.doSomethingAsyncronous(fCallback);
	}
}

module.exports = PushComprehensionsViaIntegration;
