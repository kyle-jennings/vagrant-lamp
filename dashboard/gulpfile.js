const { src, dest, series, parallel, task, watch } = require('gulp');
const autoprefixer = require('autoprefixer');
const babelify     = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const fs = require('fs');
const imagemin = require('gulp-imagemin');
const minify = require('gulp-minify');
const path = require('path');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const glob = require('glob').sync;
const notify = require('gulp-notify');


const packageJSON = require('./package.json');
const pluginName = packageJSON.name;

const paths = {
  rootPath:   './',
  srcPath:    './_src',
  dstPath:    './dist',
  npmPath :   './node_modules',
  scssGlob:   './_src/css/**/*.scss',
  jsGlob:     './_src/js/**/*.js',
  scssEntries:   './_src/css/entry*.scss',
  jsEntries:     './_src/js/entry*.js',
};

const jsFiles   = packageJSON.jsFiles   || glob(paths.jsEntries)   || [];
const scssFiles = packageJSON.scssFiles || glob(paths.scssEntries) || [];

task(
  'cachebusting',
  (done) => {
    const timestamp = (new Date()).toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-'); // yyyymmdd-hhss
    fs.writeFile( paths.rootPath + '.cachebusted', timestamp, done);
  }
);

/**
 * Clean the JS
 */
task(
  'clean:js',
  () => {
    return del(
      [ paths.dstPath + '/js/*' ],
      {read:false, force: true});
  }
);

const renamer = (file) => {
  const suffix = path.dirname(file).split(path.sep).pop();
  return pluginName + '--' + suffix;
};

// JS
task(
  'js',
  series(
    'clean:js',
    (done) => {
      // set up the browserify instance on a task basis
      const bundler = (filename) => {
        return browserify({
          entries: filename,
          debug: true
        }).transform(babelify.configure({
          presets: ["@babel/preset-env"]
        }))
        .bundle();
      }

      jsFiles.forEach((file) => {
        return bundler(file)
          .pipe(plumber())
          .pipe(source(path.basename(file)))
          .pipe(buffer())
          .pipe(sourcemaps.init())
          .pipe(rename(function(path) {
            const newName = path.basename.replace('entry-', 'entry--').replace('entry', pluginName );
            path.basename = newName;
          }))
          .pipe(minify({
            ext: {
              min: '.min.js'
            }
          }))
          .pipe(sourcemaps.write())
          .pipe(dest('./dist/js/'))
          .pipe(notify(file + ' compiled'))
      });

      done();

    }
  )
);


// clean CSS
task(
  'clean:css',
  function()
  {
    return del(
      [ paths.dstPath + '/css/*' ],
      {read:false, force: true}
    );
  }
);

// CSS
task(
  'css',
  series(
    'clean:css',
    () => {
      return src(scssFiles)
      .pipe(sourcemaps.init())
      .pipe(sass({
        includePaths: [
          paths.scssGlob,
          paths.npmPath + '/@fortawesome',
          paths.npmPath + '/normalize.css'
        ],
      }).on('error', sass.logError))
      .pipe(sourcemaps.write())
      .pipe(rename(function(path) {
        const newName = path.basename.replace('entry-', 'entry--').replace('entry', pluginName );
        path.basename = newName;
      }))
      .pipe(postcss([
        autoprefixer({ remove: false })
      ]))
      .pipe(dest(paths.dstPath + '/css'))
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(rename(function(path) {
        const newName = path.basename.replace('entry-', 'entry--').replace('entry', pluginName ) + '.min';
        path.basename = newName;
      }))
      .pipe(dest( paths.dstPath + '/css' ))
      .pipe(notify('CSS DONE'));

    }
  )
);


task(
  'clean:img',
  () => {
   return del(
     [ paths.dstPath + '/img/*' ],
     {read:false, force: true});
  }
);
/**
 * Move the img
 */
task(
  'img',
  series(
    'clean:img',
    () => {
      return src(paths.srcPath + '/img/**/*')
        .pipe(imagemin())
        .pipe(dest(paths.dstPath + '/img'));
    }
  )
);



// fonts
task('fonts', function(){
  return src([
      paths.npmPath + '/@fortawesome/fontawesome-free/webfonts/*',
      paths.srcPath + '/fonts/font-awesome/fonts/*'
    ])
    .pipe(dest(paths.dstPath + '/fonts'));
});

task('clean:fonts', function() {
   return del(
     [ paths.assetsPath + '/fonts' ],
     {read:false, force: true});
 });


/**
 * Builds the JS and SASS
 * @return {[type]} [description]
 */
task(
  'build',
  parallel(
    'css',
    'img',
    'js',
    'fonts',
    'cachebusting',
  )
)


task(
  'watch',
  series(
    'build',
    () => {
      watch(paths.scssGlob, series('css')),
      watch(paths.jsGlob, series('js'));
      return;
    }
  )
);