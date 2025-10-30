// file: jsdoc-explain.cjs
'use strict';

const { spawn } = require('node:child_process');
const { createWriteStream } = require('node:fs');
const { once } = require('node:events');

/**
 * Run the real JSDoc CLI with -X and return parsed JSON (like `jsdoc -X`).
 *
 * @param {string[]|string} files     Files/dirs/globs to parse. (e.g., ['src'] or 'src')
 * @param {string|null}     config    Path to jsdoc config file (e.g., 'jsdoc.conf.json') or null.
 * @param {boolean}         quiet     Suppress non-essential CLI output (defaults true).
 * @param {string}          cwd       Working directory (defaults process.cwd()).
 * @param {number}          timeoutMs Kill the process after N ms (0 = no timeout).
 * @param {string[]}        extraArgs Extra CLI args (e.g., ['--recurse']).
 * @param {string|null}     outFile   If set, also write raw JSON to this file.
 * @returns {Promise<any>}            Parsed JSON doclets.
 */
function jsdocExplainCLI(
  files,
  config,
  quiet,
  cwd,
  timeoutMs,
  extraArgs,
  outFile,
  fCallback
) {
  // defaults
  if (!files || (Array.isArray(files) && files.length === 0)) files = ['.'];
  if (typeof files === 'string') files = [files];
  if (typeof config === 'undefined') config = null;
  if (typeof quiet === 'undefined') quiet = true;
  if (!cwd) cwd = process.cwd();
  if (!timeoutMs) timeoutMs = 0;
  if (!Array.isArray(extraArgs)) extraArgs = [];
  if (typeof outFile === 'undefined') outFile = null;

  return new Promise((resolve, reject) => {
    // Resolve local CLI for exact parity; fallback to `npx jsdoc`
    let cmd, args;
    let usingNode = true;
    try {
      const jsdocBin = require.resolve('jsdoc/jsdoc.js', { paths: [cwd] });
      cmd = process.execPath;
      args = [
        jsdocBin,
        '-X',
        ...(quiet ? ['--quiet'] : []),
        ...(config ? ['-c', config] : []),
        ...extraArgs,
        ...files,
      ];
    } catch {
      usingNode = false;
      cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      args = [
        '-y',
        'jsdoc',
        '-X',
        ...(quiet ? ['--quiet'] : []),
        ...(config ? ['-c', config] : []),
        ...extraArgs,
        ...files,
      ];
    }

    const child = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    const killer =
      timeoutMs > 0 ? setTimeout(() => child.kill('SIGKILL'), timeoutMs) : null;

    // collect stdout (and optionally tee to file)
    let outStream = null;
    if (outFile) outStream = createWriteStream(outFile, { encoding: 'utf8' });

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (outStream) outStream.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    const finalize = async (code) => {
      if (killer) clearTimeout(killer);
      if (outStream) {
        await new Promise((r) => outStream.end(r));
      }
      if (code !== 0) {
        const how = usingNode ? 'node jsdoc/jsdoc.js' : 'npx jsdoc';
        const err = new Error(
          `JSDoc exited with code ${code} (${how}).\n${stderr || ''}`
        );
        err.code = code;
        err.stderr = stderr;
        err.stdout = stdout;
        reject(err);
        return fCallback(err);
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        const head = stdout.slice(0, 3000);
        const err = new Error(
          `Failed to parse JSDoc JSON. Ensure --quiet and plugins don't write to stdout.\n` +
            `Parse error: ${e.message}\n--- stdout (head) ---\n${head}`
        );
        err.stderr = stderr;
        err.stdout = stdout;
        reject(err);
      }
	  return fCallback();
    };

    child.on('close', finalize);
    child.on('error', reject);
  });
}

module.exports = jsdocExplainCLI;

/*
Example usage:

const explain = require('./jsdoc-explain.cjs');

(async () => {
  const data = await explain(
    ['modules/pict/pict-view/source/Pict-View.js'], // files
    'jsdoc.conf.json',                               // config
    true,                                            // quiet
    process.cwd(),                                   // cwd
    0,                                               // timeoutMs
    ['--recurse'],                                   // extraArgs
    'docs.json'                                      // outFile (optional)
  );
  console.log('Doclets:', data.length);
})();
*/
