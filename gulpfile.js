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

var gulp = require('gulp');

var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var inlineSource = require('gulp-inline-source');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');

var outDir = 'out/';

var paths = {
    html: ['index.html'],
    images: ['images/*.png'],
    extras: ['manifest.json', 'favicon.ico'],
    scripts: ['simple-offline-service-worker.js']
};

gulp.task('clean', function() {
    return del(outDir);
});

// Optimize and copy images
gulp.task('images', ['clean'], function() {
    var imageminOptions = {
        use: [pngquant({quality: '65-80', speed: 1})]
    };
    return gulp.src(paths.images)
        .pipe(imagemin(imageminOptions))
        .pipe(gulp.dest(outDir + 'images/'));
});

gulp.task('minifyHtmlCssJs', ['clean'], function() {
    var inlineSourceOptions = {
        compress: false
    };
    var htmlminOptions = {
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        preserveLineBreaks: true,
        removeComments: true
    };
    return gulp.src(paths.html)
        .pipe(inlineSource(inlineSourceOptions))
        .pipe(htmlmin(htmlminOptions))
        .pipe(gulp.dest(outDir));
});

gulp.task('minifyExternalScripts', ['clean'], function() {
    return gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(gulp.dest(outDir));
});

gulp.task('copy', ['clean'], function() {
    // Copy extras
    gulp.src(paths.extras)
        .pipe(gulp.dest(outDir));
});

gulp.task('default', ['clean', 'copy', 'images', 'minifyHtmlCssJs', 'minifyExternalScripts']);
