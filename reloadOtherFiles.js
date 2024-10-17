const fs = require('fs');
const { exec, execSync } = require('child_process');
const packageJson = require(`${process.cwd()}/package.json`);

const processIdentifiers = 'Reload Watcher';

if (!packageJson) {
    throw new Error(`[${processIdentifiers}]: Package json is missing`);
}

if (!packageJson.quackageWatchFolders) {
    throw new Error(`[${processIdentifiers}]: Package watch folders are missing`);
}

//this is the list of directories that will trigger the rebuild / deploy
const directories = packageJson.quackageWatchFolders;

const reloadCommand = 'npx quack copy';
const reload = function (event, filename) {
    console.log(`[${processIdentifiers}]: File change detected in `, filename);
    exec(reloadCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`[${processIdentifiers}]: `);
            console.error(`[${processIdentifiers}]: Error:`);
            console.error(`[${processIdentifiers}]: ` + err);
            console.error(`[${processIdentifiers}]: `);
        }
        console.log(`[${processIdentifiers}]: Files rebuilt`);
    });
}

directories.forEach((dir) => {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.watch(dir,{ recursive: true },  (event, filename) => reload(event, filename));
    }
    catch (exception) {
        console.log(`[${processIdentifiers}]: Error watching ${dir} `, exception.message);
    }
});