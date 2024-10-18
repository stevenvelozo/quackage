'use strict';

console.log(`[ Quackage-Gulpfile.js ] ---> Loading the gulp config...`);
let _CONFIG = JSON.parse(process.env.QuackageBuildConfig);
//process.env['BABEL_SHOW_CONFIG_FOR'] = `${_CONFIG.EntrypointInputSourceFile} npm start`;
console.log(`   > Building to [${_CONFIG.LibraryUniminifiedFileName}] and [${_CONFIG.LibraryMinifiedFileName}]`);
console.log(`--> Gulp is taking over!`);
console.log('BROWSERSLIST: ', process.env['BROWSERSLIST']);
const libBrowserify = require('browserify');
const libGulp = require('gulp');

const libVinylSourceStream = require('vinyl-source-stream');
const libVinylBuffer = require('vinyl-buffer');

const libSourcemaps = require('gulp-sourcemaps');
const libBabel = require('gulp-babel');
const libTerser = require('gulp-terser');

const libWatchify = require('watchify');

libGulp.task
(
    'watch',
    () => {
        const customOptions = {
            entries: _CONFIG.EntrypointInputSourceFile,
            standalone: _CONFIG.LibraryObjectName,
            debug: true,
            cache: {},
            packageCache: {}
        }
        const options = Object.assign({}, libWatchify.args, customOptions);
        const browserify = libWatchify(libBrowserify(options), { poll: true });
        const babelOptions = { 'targets': process.env['BROWSERSLIST']};

        browserify.on('update', () => {
            buildUnminified(browserify, babelOptions);
            buildMinified(browserify, babelOptions);
        });

        browserify.on('log', console.log);
        browserify.on('error', console.error);

        buildUnminified(browserify, babelOptions);
        buildMinified(browserify, babelOptions);
    }
)

function buildUnminified(browserify, babelOptions) {
    browserify.bundle()
        .pipe(libVinylSourceStream(_CONFIG.LibraryUniminifiedFileName))
        .pipe(libVinylBuffer())
        .pipe(libSourcemaps.init({loadMaps: true}))
        .pipe(libBabel(babelOptions)).on('error', console.log)
        .pipe(libGulp.dest(_CONFIG.LibraryOutputFolder));
}

function buildMinified(browserify, babelOptions) {
    browserify.bundle()
        .pipe(libVinylSourceStream(_CONFIG.LibraryMinifiedFileName))
        .pipe(libVinylBuffer())
        .pipe(libSourcemaps.init({loadMaps: true}))
        .pipe(libBabel(babelOptions))
        .pipe(libTerser()).on('error', console.log)
        .pipe(libSourcemaps.write('./'))
        .pipe(libGulp.dest(_CONFIG.LibraryOutputFolder));
}