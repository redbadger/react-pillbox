var gulp = require('gulp');
var _ = require('lodash');
var react = require('gulp-react');
var karma = require('karma').server;

var karmaCommonConf = {
  browsers: ['PhantomJS'],
  frameworks: ['jasmine'],
  reporters: ['dots'],
  files: [
    'test/helpers/**/*.js',
    'dev/js/lib/react/react-with-addons.js',
    'dev/js/pillbox.js',
    'test/**/*.spec.js'
  ]
};

/**
 * Run test once and exit
 */
gulp.task('test', ['react-dev', 'react-test', 'copy-dev'], function (done) {
  karma.start(_.assign({}, karmaCommonConf, {singleRun: true}), done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  karma.start(karmaCommonConf, done);
});

gulp.task('watch', function(done) {
  gulp.watch(['src/**/*', 'test/**/*'], ['react-dev', 'react-test', 'copy-dev-css']);
});

/**
 * Copy css files to dev
 */
gulp.task('copy-dev-css', function(done) {
  return gulp.src('src/css/**/*')
        .pipe(gulp.dest('dev/css'));
});

/**
 * Copy css files to dist
 */
gulp.task('copy-dist-css', function(done) {
  return gulp.src('src/css/**/*')
    .pipe(gulp.dest('dist/css'));
});

/**
 * Copy react.js to dev
 */
gulp.task('copy-dev-lib', function(done) {
  return gulp.src(['bower_components/**/*'])
    .pipe(gulp.dest('dev/js/lib'));
});

/**
 * Transform JSX files and copy over to dev
 */
gulp.task('react-dev', function(done) {
  return gulp.src('src/**/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('dev'));
});

/**
 * Transform JSX spec files
 */
gulp.task('react-test', function(done) {
  return gulp.src('test/**/*.jsx')
    .pipe(react())
    .pipe(gulp.dest('test'));
});

/**
 * Transform JSX files and copy over to dist
 */
gulp.task('react-dist', function(done) {
  return gulp.src('src/**/*.jsx')
    .pipe(react())
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-dev', ['copy-dev-css', 'copy-dev-lib']);
gulp.task('copy-dist', ['copy-dist-css']);

gulp.task('default', ['react-dev', 'copy-dev', 'test']);
gulp.task('dev', ['react-dev', 'copy-dev', 'watch', 'tdd']);
gulp.task('dist', ['default', 'react-dist', 'copy-dist']);
