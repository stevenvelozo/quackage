console.log('Fancy debug harness here.  Shame if it would get quacked.');

let libQuackage = require('../source/Quackage-CLIProgram.js');

//libQuackage.run(['node', 'Harness.js', 'db', 'dist/documentation', '--meadow', 'model/MeadowModel-Extended.json']);

libQuackage.run(['node', 'Harness.js', 'db', 'dist/documentation', '--meadow', 'model/MeadowModel-Extended.json', '-d', 'documentation-definition.json']);

//libQuackage.run(['node', 'Harness.js', 'db', 'dist/documentation', '--meadow', 'lib/headlight_model/json/Headlight-Extended.json', '-d', 'lib/headlight_model/docs/customer-documentation-definition.json']);