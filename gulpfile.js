// Build step, just type:
//   gulp
//
// Prereqs:
//   1) Install Node and NPM from https://nodejs.org
//      Known to work with Node 4.2.6 and NPM 2.14.12
//   2) Install dependencies from package.json
//      npm install
//
// The purpose of this build step is just to crush the output filesize. Everything should work
// when loaded directly out of the root directory without running this build step.
//
// Some optimizations have not been performed to make things easier to debug and hack. Cost: 20Kb.
var gulp = require('gulp');

var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var inlinesource = require('gulp-inline-source');

var outDir = 'out/';

var paths = {
    scripts: ['include/buffer/buffer.js'],
    html: ['index.html'],
    images: ['*.png'],
    extras: ['manifest.json', 'favicon.ico', 'roboto400latin.woff2', 'roboto500latin.woff2'],
};

gulp.task('clean', function() {
    return del(outDir);
});

// Optimize and copy images
gulp.task('images', ['clean'], function() {
    return gulp.src(paths.images)
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(outDir));
});

// Inline source
gulp.task('inlinesource', ['clean'], function () {
    var options = {
        compress: true
    };
    return gulp.src(paths.html)
        .pipe(inlinesource(options))
        .pipe(gulp.dest(outDir));
});

gulp.task('copy', ['clean'], function() {
    // Copy extras
    gulp.src(paths.extras)
        .pipe(gulp.dest(outDir));
});

gulp.task('default', ['clean', 'copy', 'images', 'inlinesource']);