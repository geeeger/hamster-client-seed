const browserSync  = require('browser-sync')

let   browser      = browserSync.create()

let   gutil        = require('gulp-util')

module.exports     = {
    log           : gutil.log,
    gutil         : gutil,
    lodash        : require('lodash'),
    gulp          : require('gulp'),
    path          : require('path'),
    addHeader     : require('./header.js'),
    callback      : require('./callback.js'),
    gulpif        : require('gulp-if'),
    babelify      : require('babelify'),
    autoprefixer  : require('gulp-autoprefixer'),
    sass          : require('gulp-sass'),
    uglify        : require('gulp-uglify'),
    rename        : require('gulp-rename'),
    watchs        : require('gulp-watch'),
    minifyCss     : require('gulp-minify-css'),
    eslint        : require('gulp-eslint'),
    concat        : require('gulp-concat'),
    plumber       : require('gulp-plumber'),
    es            : require("event-stream"),
    browserify    : require('gulp-browserify'),
    browserSync   : browserSync,
    browser       : browser,
    reload        : browser.reload
}




