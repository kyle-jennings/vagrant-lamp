'use strict';

var gulp         = require('gulp');
var plugins      = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var browserify   = require('browserify');
var buffer       = require('vinyl-buffer');
var cssnano      = require('gulp-cssnano');
var concat       = require('gulp-concat');
var del          = require('del');
var fs           = require('fs');
var util         = require('gulp-util');
var imagemin     = require('gulp-imagemin');
var merge        = require('merge-stream');
var minify       = require('gulp-minify');
var notify       = require('gulp-notify');
var path         = require('path');
var plumber      = require('gulp-plumber');
var postcss      = require('gulp-postcss');
var pngquant     = require('imagemin-pngquant');
var rename       = require('gulp-rename');
var requireDir   = require('require-dir');
var sass         = require('gulp-sass');
var source       = require('vinyl-source-stream');
var sourcemaps   = require('gulp-sourcemaps');
var transform    = require('vinyl-transform');
var uglify       = require('gulp-uglify');
var watch        = require('gulp-watch');
var wpPot        = require('gulp-wp-pot');


/**
 * Handle errors.
 * plays a noise and display notification
 */
function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Task Failed [<%= error.message %>',
    message: 'See console.',
    sound: 'Sosumi'
  }).apply(this, args);
  util.beep();
  this.emit('end');
}

function getFolders(dir) {
  return fs.readdirSync(dir)
  .filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

// dir paths
var paths = {
  srcPath:          '.',
  distPath:       '../dist',
  npmPath :         './node_modules',
  vendorPath:       './js/vendor'
};
paths.scssGlob      = paths.srcPath + '/scss/**/*.scss';
paths.jsGlob        = paths.srcPath + '/js/**/*.js';

var scssFiles = [
    paths.srcPath + '/scss/site.scss',
];

var cssFiles = scssFiles.map(function(f){
    return f.replace('.scss', '.css');
});
// ---------------------------------------------------------------------------
//  Tasks
// ---------------------------------------------------------------------------





/**
 * Build the CSS
 */
gulp.task('css', ['scss'],function(){
  return gulp.src(cssFiles)
  .pipe(plumber({ errorHandler: handleErrors }))
  .pipe(cssnano({ safe: true }))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest( paths.distPath + '/css'));

});

gulp.task('scss', ['clean:css'], function(){
  return gulp.src(scssFiles)
  .pipe(plumber({ errorHandler: handleErrors }))
  .pipe(sourcemaps.init())
  .pipe(sass({
    includePaths: [
      paths.scssGlob
    ],
    errLogToConsole: true,
    outputStyle: 'expanded'
  }))
  .pipe(postcss([
    autoprefixer({ browsers: ['last 2 version'] })
  ]))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest( paths.distPath + '/css' ));

});

gulp.task('clean:css', function(){
    return del(
      [ paths.distPath + '/css' ],
      {read:false, force: true}
    );
});

/**
 * @param  {[type]}
 * @return {[type]}
 */
gulp.task('fonts', ['clean:fonts'], function() {
  return gulp.src(paths.npmPath + '/@fortawesome/fontawesome-free/webfonts/*')
    .pipe(gulp.dest(paths.distPath  + '/fonts/'))
})


gulp.task('clean:fonts', function(){
    return del(
      [ paths.distPath + '/fonts' ],
      {read:false, force: true}
    );
});

/**
 * Builds the JS and SASS
 * @return {[type]} [description]
 */
gulp.task('build', function(){
  gulp.start('css');
  gulp.start('fonts');
});

/**
 * Default Task, runs build and then watch
 * @return {[type]} [description]
 */
gulp.task('default', function(){
  gulp.start('watch');
});


/**
 * Process tasks and reload browsers.
 */
gulp.task('watch', function() {
  gulp.start('build');
  gulp.watch(paths.scssGlob, ['css']);
});