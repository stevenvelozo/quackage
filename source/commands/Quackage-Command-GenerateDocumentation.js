const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

const libOS = require('os');
const libFS = require('fs');
const libPath = require('path');

const { spawn } = require('node:child_process');
const { createWriteStream } = require('node:fs');
const { once } = require('node:events');

class QuackageCommandGenerateDocumentation extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'generate-documentation';
		this.options.Description = 'Generate documentation from source files and markdown files';

		this.options.CommandArguments.push({ Name: '<output_folder>', Description: 'The folder in which to generate content' });

		this.options.CommandOptions.push({ Name: '-m, --markdown [markdown_documentation_folder]', Description: 'Folder with markdwon documentation; subfolders are okay.', Default: '' });
		this.options.CommandOptions.push({ Name: '-s, --source [source_code_folder]', Description: 'Folder with javascript source to parse jsdoc from.', Default: false });
		// this.options.CommandOptions.push({ Name: '-g, --source_glob [source_code_glob_pattern]', Description: 'Glob pattern for source code files to include.', Default: '' });
		// this.options.CommandOptions.push({ Name: '-p, --private', Description: 'Include private members in the generated documentation.', Default: false });
		this.options.CommandOptions.push({ Name: '-c, --config [jsdoc_config_file]', Description: 'Path to a JSDoc config file to use when generating documentation.', Default: false });

		this.options.Aliases.push('dgen');

		this.addCommand();
	}

	/**
	 * Run the real JSDoc CLI with -X and return parsed JSON (like `jsdoc -X`).
	 *
	 * @param {string[]|string} pFilesArray     Files/dirs/globs to parse. (e.g., ['src'] or 'src')
	 * @param {string|null}     pJSDocConfig    Path to jsdoc config file (e.g., 'jsdoc.conf.json') or null.
	 * @param {boolean}         pSuppressOutput     Suppress non-essential CLI output (defaults true).
	 * @param {string}          pProcessCWD       Working directory (defaults process.cwd()).
	 * @param {number}          pTimoutMs Kill the process after N ms (0 = no timeout).
	 * @param {string[]}        pCLIExtraArguments Extra CLI args (e.g., ['--recurse']).
	 * @param {string|null}     pOutputFile   If set, also write raw JSON to this file.
	 * @returns {Promise<any>}            Parsed JSON doclets.
	 */
	runJSDocCLI(pFilesArray, pJSDocConfig, pSuppressOutput, pProcessCWD, pTimoutMs, pCLIExtraArguments, pOutputFile, fCallback)
	{
		if (!pFilesArray || (Array.isArray(pFilesArray) && pFilesArray.length === 0)) pFilesArray = ['.'];
		if (typeof pFilesArray === 'string') pFilesArray = [pFilesArray];
		if (typeof pJSDocConfig === 'undefined') pJSDocConfig = null;
		if (typeof pSuppressOutput === 'undefined') pSuppressOutput = true;
		if (!pProcessCWD) pProcessCWD = process.cwd();
		if (!pTimoutMs) pTimoutMs = 0;
		if (!Array.isArray(pCLIExtraArguments)) pCLIExtraArguments = [];
		if (typeof pOutputFile === 'undefined') pOutputFile = null;

		return new Promise((resolve, reject) =>
		{
			// Resolve local CLI in the node_modules folder and try that; fallback to `npx jsdoc` if this fails
			let tmpCommandPath, tmpCommandArguments;
			let tmpExecuteUsingNode = true;
			try
			{
				const jsdocBin = require.resolve('jsdoc/jsdoc.js', { paths: [pProcessCWD] });
				tmpCommandPath = process.execPath;
				tmpCommandArguments = [
					jsdocBin,
					'-X',
					...(pSuppressOutput ? ['--quiet'] : []),
					...(pJSDocConfig ? ['-c', pJSDocConfig] : []),
					...pCLIExtraArguments,
					...pFilesArray,
				];
			}
			catch
			{
				tmpExecuteUsingNode = false;
				tmpCommandPath = process.platform === 'win32' ? 'npx.cmd' : 'npx';
				tmpCommandArguments = [
					'-y',
					'jsdoc',
					'-X',
					...(pSuppressOutput ? ['--quiet'] : []),
					...(pJSDocConfig ? ['-c', pJSDocConfig] : []),
					...pCLIExtraArguments,
					...pFilesArray,
				];
			}

			const tmpChild = spawn(tmpCommandPath, tmpCommandArguments, { cwd: pProcessCWD, stdio: ['ignore', 'pipe', 'pipe'] });

			let tmpStdOut = '';
			let tmpStdErr = '';

			const tmpTimeoutSignal = pTimoutMs > 0 ? setTimeout(() => tmpChild.kill('SIGKILL'), pTimoutMs) : null;

			let tmpOutputStream = null;
			if (pOutputFile)
			{
				tmpOutputStream = createWriteStream(pOutputFile, { encoding: 'utf8' });
			}

			tmpChild.stdout.setEncoding('utf8');
			tmpChild.stderr.setEncoding('utf8');

			tmpChild.stdout.on('data',
				(pChunk) =>
				{
					tmpStdOut += pChunk;
					if (tmpOutputStream) tmpOutputStream.write(pChunk);
				});
			tmpChild.stderr.on('data',
				(pChunk) =>
				{
					tmpStdErr += pChunk;
				});

			const finalize = async (pProcessReturnCode) =>
			{
				if (tmpTimeoutSignal)
				{
					clearTimeout(tmpTimeoutSignal);
				}

				if (tmpOutputStream)
				{
					await new Promise(
						(pResult) =>
						{
							tmpOutputStream.end(pResult)
						});
				}
				if (pProcessReturnCode !== 0)
				{
					const tmpExecutionMethod = tmpExecuteUsingNode ? 'node jsdoc/jsdoc.js' : 'npx jsdoc';
					const tmpError = new Error(`JSDoc exited with code ${pProcessReturnCode} (${tmpExecutionMethod}).\n${tmpStdErr || ''}`);
					tmpError.code = pProcessReturnCode;
					tmpError.stderr = tmpStdErr;
					tmpError.stdout = tmpStdOut;
					reject(tmpError);
					return fCallback(tmpError);
				}
				try
				{
					resolve(JSON.parse(tmpStdOut));
				}
				catch (pError)
				{
					const tmpStdOutHead = tmpStdOut.slice(0, 3000);
					const tmpError = new Error(
						`Failed to parse JSDoc JSON. Ensure --quiet and plugins don't write to stdout.\n` +
						`Parse error: ${pError.message}\n--- stdout (head) ---\n${tmpStdOutHead}`
					);
					tmpError.stderr = tmpStdErr;
					tmpError.stdout = tmpStdOut;
					reject(tmpError);
				}
				return fCallback();
			};

			tmpChild.on('close', finalize);
			tmpChild.on('error', reject);
		});
	}

	onRunAsync(fCallback)
	{
		const libFilePersistence = this.services.FilePersistence;

		const tmpOperationState = {};
		tmpOperationState.RawOutputFolderPath = this.ArgumentString;

		tmpOperationState.RawSourceCodeFolder = this.CommandOptions.source;
		//tmpOperationState.SourceCodeGlobPattern = this.CommandOptions.source_glob;

		tmpOperationState.RawMarkdownFolder = this.CommandOptions.markdown;

		tmpOperationState.IncludePrivate = this.CommandOptions.private;
		tmpOperationState.JSDocConfigPath = this.CommandOptions.config;

		this.log.info(`Generating documentation...`);

		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(`Documentation Phase 0: Preparing configurations...`);
				tmpOperationState.OutputFolderPath = libPath.resolve(tmpOperationState.RawOutputFolderPath);
				tmpOperationState.OutputFolderExists = libFilePersistence.existsSync(tmpOperationState.OutputFolderPath);
				if (tmpOperationState.OutputFolderExists === false)
				{
					this.log.info(`...creating output folder [${tmpOperationState.OutputFolderPath}]`);
					libFS.mkdirSync(tmpOperationState.OutputFolderPath, { recursive: true });
					tmpOperationState.OutputFolderExists = libFilePersistence.existsSync(tmpOperationState.OutputFolderPath);
					if (tmpOperationState.OutputFolderExists === false)
					{
						return fNext(new Error(`Failed to create output folder [${tmpOperationState.OutputFolderPath}]`));
					}
				}
				this.log.info(`Resolved output folder path to [${tmpOperationState.OutputFolderPath}] -- Exists: ${tmpOperationState.OutputFolderExists}`);
				tmpOperationState.JSDocOutputPath = libPath.join(tmpOperationState.OutputFolderPath, 'JSDocOutput.json');
				
				if (tmpOperationState.RawSourceCodeFolder)
				{
					tmpOperationState.SourceCodeFolderPath = libPath.resolve(tmpOperationState.RawSourceCodeFolder);
					tmpOperationState.SourceCodeFolderExists = libFilePersistence.existsSync(tmpOperationState.SourceCodeFolderPath);
					this.log.info(`Resolved source code folder path to [${tmpOperationState.SourceCodeFolderPath}] -- Exists: ${tmpOperationState.SourceCodeFolderExists}`);
					//tmpOperationState.SourceCodeFolderMatchesGlob = libPath.join(tmpOperationState.SourceCodeFolderPath, tmpOperationState.SourceCodeGlobPattern);
					// tmpOperationState.SourceCodeFolderJSDocParameter = [tmpOperationState.SourceCodeFolderMatchesGlob];
					tmpOperationState.SourceCodeFolderJSDocParameter = [tmpOperationState.SourceCodeFolderPath];
					//this.log.info(`Using source code glob pattern [${tmpOperationState.SourceCodeGlobPattern}] -- Full JSDoc parameter: ${tmpOperationState.SourceCodeFolderMatchesGlob}`);
				}
				else
				{
					tmpOperationState.SourceCodeFolder = false;
					this.log.info(`No source code folder specified; skipping source code documentation generation.`);
				}

				return fNext();
			}.bind(this));

		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(`Documentation Phase 1: Gathering documentation metadata...`);
				this.runJSDocCLI(tmpOperationState.SourceCodeFolderJSDocParameter, null, false, './', 60000, [], tmpOperationState.JSDocOutputPath, fNext);
			}.bind(this));

		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(`Documentation Phase 2: Gathering code metadata...`);

				return fNext();
			}.bind(this));

		tmpAnticipate.anticipate(
			function (fNext)
			{
				this.log.info(`Documentation Phase 3: Generating structured description...`);
				tmpOperationState.OutputFolderPath = libPath.resolve(tmpOperationState.RawOutputFolderPath);
				this.log.info(`Resolved output folder path to [${tmpOperationState.OutputFolderPath}]`);
				
				if (tmpOperationState.RawSourceCodeFolder)
				{
					tmpOperationState.SourceCodeFolder = libPath.resolve(tmpOperationState.RawSourceCodeFolder);
					this.log.info(`Resolved source code folder path to [${tmpOperationState.SourceCodeFolder}]`);
				}
				else
				{
					tmpOperationState.SourceCodeFolder = false;
					this.log.info(`No source code folder specified; skipping source code documentation generation.`);
				}

				return fNext();
			}.bind(this));


		return tmpAnticipate.wait(
			function (pError)
			{
				if (pError)
				{
					return fCallback(pError);
				}

				this.log.info(`Documentation generation complete.`);

				return fCallback();
			}.bind(this));
	};
}

module.exports = QuackageCommandGenerateDocumentation;