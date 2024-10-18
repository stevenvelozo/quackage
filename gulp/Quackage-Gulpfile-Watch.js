'use strict';

console.log(`[ Quackage-Gulpfile.js ] ---> Loading the gulp config...`);
let _CONFIG = JSON.parse(process.env.QuackageBuildConfig);

Object.keys(_CONFIG).forEach(function (key) { console.log(key); });
console.log('Unminified file: ', _CONFIG['LibraryUniminifiedFileName']);

console.log(`   > Building to [${_CONFIG.LibraryUniminifiedFileName}] and [${_CONFIG.LibraryMinifiedFileName}]`)

// --->  Boilerplate Browser Uglification and Packaging  <--- \\
console.log(`--> Gulp is taking over!`);

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
        browserify.on('update', () => {
            browserify.bundle()
                .pipe(libVinylSourceStream(_CONFIG.LibraryUniminifiedFileName))
                .pipe(libVinylBuffer())
                .pipe(libSourcemaps.init({loadMaps: true}))
                .pipe(libBabel()).on('error', console.log)
                .pipe(libGulp.dest(_CONFIG.LibraryOutputFolder));

            browserify.bundle()
                .pipe(libVinylSourceStream(_CONFIG.LibraryMinifiedFileName))
                .pipe(libVinylBuffer())
                .pipe(libSourcemaps.init({loadMaps: true}))
                .pipe(libBabel())
                .pipe(libTerser()).on('error', console.log)
                .pipe(libSourcemaps.write('./'))
                .pipe(libGulp.dest(_CONFIG.LibraryOutputFolder));
        });
        browserify.on('log', console.log);
        browserify.on('error', console.error);

        browserify.bundle()
            .pipe(libVinylSourceStream(_CONFIG.LibraryUniminifiedFileName))
            .pipe(libVinylBuffer())
            .pipe(libSourcemaps.init({loadMaps: true}))
            .pipe(libBabel()).on('error', console.log)
            .pipe(libGulp.dest(_CONFIG.LibraryOutputFolder));

        browserify.bundle()
            .pipe(libVinylSourceStream(_CONFIG.LibraryMinifiedFileName))
            .pipe(libVinylBuffer())
            .pipe(libSourcemaps.init({loadMaps: true}))
            .pipe(libBabel())
            .pipe(libTerser()).on('error', console.log)
            .pipe(libSourcemaps.write('./'))
            .pipe(libGulp.dest(_CONFIG.LibraryOutputFolder));
    }
)