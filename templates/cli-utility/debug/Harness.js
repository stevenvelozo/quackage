#!/usr/bin/env node

// This loads the service directly rather than exercising the wrapping "run" script, which is what is executed from the CLI
let libCLIService = require('../source/CLI-Program.js');

libCLIService.run(['node', 'Harness.js', 'do', "Some_file_name.txt" /* you can add comma separated arugments here */]);
