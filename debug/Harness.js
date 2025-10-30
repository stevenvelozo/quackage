console.log('Fancy debug harness here.  Shame if it would get quacked.');

let libQuackage = require('../source/Quackage-CLIProgram.js');

//libQuackage.run(['node', 'Harness.js', 'bp', 'pictunittest']);
//libQuackage.run(['node', 'Harness.js', 'lint']);

libQuackage.run(['node', 'Harness.js', 'dgen', 'output_docs', '--source', '/Users/stevenvelozo/Code/retold/modules/pict/pict/source/']);
