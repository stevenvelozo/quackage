console.log('Fancy debug harness here.  Shame if it would get quacked.');

let libQuackage = require('../source/Quackage-CLIProgram.js');

//libQuackage.run(['node', 'Harness.js', 'bp', 'pictunittest']);
//libQuackage.run(['node', 'Harness.js', 'lint']);

libQuackage.run(['node', 'Harness.js', 'csvcheck', 'testdata/airports.csv', '-c']);
//libQuackage.run(['node', 'Harness.js', 'csvtransform', 'testdata/airports.csv', '-x']);
//libQuackage.run(['node', 'Harness.js', 'csvtransform', 'testdata/airports.csv', '-x', '-m', 'testdata/Airport-Entity-Mapping.json']);
//libQuackage.run(['node', 'Harness.js', 'csvtransform', 'testdata/airports.csv']);
//libQuackage.run(['node', 'Harness.js', 'csvtransform', 'testdata/airports.csv', '-m', 'testdata/Airport-Entity-Mapping.json']);

//libQuackage.run(['node', 'Harness.js', 'csvintersect', 'testdata/Fruit-Color.csv', '-f', 'Fruit', '-s', 'Color', '-x']);
//libQuackage.run(['node', 'Harness.js', 'csvintersect', 'testdata/Fruit-Color.csv', '-f', 'Fruit', '-s', 'Color']);
//libQuackage.run(['node', 'Harness.js', 'csvintersect', 'testdata/Fruit-Color.csv', '-f', 'Fruit', '-s', 'Color', '-o', 'dist/Fruit-Color.json']);

//libQuackage.run(['node', 'Harness.js', 'ajv', 'html/', '-p', 'PictoView']);

//libQuackage.run(['node', 'Harness.js', 'db', 'dist/documentation', '--meadow', 'model/MeadowModel-Extended.json']);
//libQuackage.run(['node', 'Harness.js', 'db', 'dist/documentation', '--meadow', 'model/MeadowModel-Extended.json', '-d', 'documentation-definition.json']);
