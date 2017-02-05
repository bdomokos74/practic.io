"use strict";

import gulp from 'gulp';
import babel from 'gulp-babel';
import fs from 'fs';
import browserify from 'browserify'
import babelify from 'babelify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';
import sourceMaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';


var jasmine = require('gulp-jasmine');

gulp.task('default', function() {
    return browserify('./es6/app.js', {debug: true})
    .transform(babelify)
    .bundle()
        .on('error', function (err) { console.error(err); })
        .pipe(source('bundle.js'))
        .pipe(buffer())
            .pipe(sourceMaps.init({ loadMaps : true }))  // Strip inline source maps
            .pipe(uglify())
         .pipe(sourceMaps.write('./maps')) 
        .pipe(gulp.dest('public'));
});

gulp.task('test', function() {
    return gulp.src('./tests/*_spec.js')
        .pipe(jasmine());
});

//
//
// gulp.task('bundle', function () {
//     var bundler = browserify([])  // Pass browserify the entry point
//     .transform(babelify);  // Then, babelify, with ES2015 preset
//
//     bundle(bundler);  // Chain other options -- sourcemaps, rename, etc.
// })
//
// function bundle (bundler) {
//
//     // Add options to add to "base" bundler passed as parameter
//     bundler
//         .bundle()                                                        // Start bundle
//         .on('error', function (err) { console.error(err); })
//         .pipe(source('app.js'))                        // Entry point
//         .pipe(buffer())                                               // Convert to gulp pipeline
//         // .pipe(rename(config.js.outputFile))          // Rename output from 'main.js'
//         // .pipe(sourceMaps.init({ loadMaps : true }))  // Strip inline source maps
//         // .pipe(sourceMaps.write(config.js.mapDir))    // Save source maps to their
//         .pipe(uglify())
//         .pipe(gulp.dest(config.js.outputDir));        // Save 'bundle' to build/
//       //.pipe(livereload());                                       // Reload browser if relevant
// }
