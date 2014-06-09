var gulp = require('gulp');
var _ = require('lodash');
var react = require('gulp-react');
var karma = require('karma').server;

var karmaCommonConf = {
  browsers: ['PhantomJS'],
  frameworks: ['jasmine'],
  reporters: ['dots'],
  files: [
    'test/helpers/phantomjs-shims.js',
    'dev/js/lib/react/react.js',
    'dev/js/pillbox.js',
    'test/**/*.spec.js'
  ]
};

/**
 * Run test once and exit
 */
gulp.task('test', ['react', 'copy'], function (done) {
  karma.start(_.assign({}, karmaCommonConf, {singleRun: true}), done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  karma.start(karmaCommonConf, done);
});

gulp.task('watch', function(done) {
  gulp.watch(['src/**/*.js', 'src/css/**/*'], ['react', 'copy-css']);
});

/**
 * Copy css files to dev
 */
gulp.task('copy-css', function(done) {
  return gulp.src('src/css/**/*')
        .pipe(gulp.dest('dev/css'));
});

/**
 * Copy react.js to dev
 */
gulp.task('copy-lib', function(done) {
  return gulp.src(['bower_components/**/*'])
    .pipe(gulp.dest('dev/js/lib'));
});

/**
 * Transform JSX files and copy over to dev
 */
gulp.task('react', function(done) {
  return gulp.src('src/**/*.js')
        .pipe(react())
        .pipe(gulp.dest('dev'));
});

gulp.task('copy', ['copy-css', 'copy-lib']);

gulp.task('default', ['react', 'copy', 'test']);
gulp.task('dev', ['react', 'copy', 'watch', 'tdd']);
