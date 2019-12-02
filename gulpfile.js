const {src, dest, parallel} = require('gulp');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');

function minifyJs() {
  return src('resources/js/*.js')
    .pipe(concat('index.min.js'))
    .pipe(dest('resources/dist'))
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(sourcemaps.write('./'))
    .pipe(dest('resources/dist'));
}

function minifyCss() {
  return src('resources/stylesheets/*.css')
    .pipe(concat('index.min.css'))
    .pipe(dest('resources/dist'))
    .pipe(csso({ sourceMap: true }))
    .pipe(dest('resources/dist'));
}

exports.default = parallel(minifyJs, minifyCss);
