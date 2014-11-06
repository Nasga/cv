'use strict';
var gulp = require('gulp')
  , gutil = require('gulp-util')
  , jade = require('gulp-jade')
  , rm = require('gulp-rm')
  , fs = require('fs')
  , del = require('del')
  , express = require('express')
  , expressPort = 8080
  , app = express()
  , livereload = require('gulp-livereload')
  , liveReloadPort = 35729
  , tinylr = require('tiny-lr')
  , server = tinylr()
  , srcPath = 'src/'
  , distPath = 'dist/'
;

gulp.task('clean', function() {
  return del([
    distPath
  ]);
});

gulp.task('mkdir', function() {
  try {
    fs.mkdirSync(distPath);
  } catch (e) {
  }
  try {
    fs.mkdirSync(distPath + 'fonts/');
  } catch (e) {
  }
  try {
    fs.mkdirSync(distPath + 'css/');
  } catch (e) {
  }
  try {
    fs.mkdirSync(distPath + 'images/');
  } catch (e) {
  }

  return gulp
    .src([srcPath + 'images/*'])
    .pipe(gulp.dest(distPath + 'images/'))
  ;
});

gulp.task('build-fonts', function() {
  gulp.src([srcPath + 'fonts/*.ttf'])
    .pipe(gulp.dest(distPath + 'fonts/'))
    .pipe(require('gulp-ttf2eot')())
    .pipe(gulp.dest(distPath + 'fonts/'))
  ;
  gulp.src([srcPath + 'fonts/*.ttf'])
    .pipe(require('gulp-ttf2woff')())
    .pipe(gulp.dest(distPath + 'fonts/'))
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('build-css', function() {
  return gulp.src(srcPath + 'less/screen.less')
    .pipe(require('gulp-streamify')(require('gulp-less')))
    .on('error', function(error) {
      gutil.log(error);
      this.emit('end');
    })
    .pipe(gulp.dest(distPath + 'css/'))
    .pipe(livereload(server))
  ;
});

gulp.task('build-html', function() {
  return gulp.src(srcPath + 'index.jade')
    .pipe(jade({pretty: true}))
    .on('error', function(error) {
      gutil.log(error);
      this.emit('end');
    })
    .pipe(gulp.dest(distPath + 'index.html'))
    .pipe(livereload(server))
  ;
});

gulp.task('server', function() {
  app.use(express.query())
    .use(express.bodyParser())
    .use(require('connect-livereload')({
      port: liveReloadPort
    }))
    .use(express.static(__dirname + '/' + distPath))
    .use(express.logger())
    .listen(expressPort, function() {
      gutil.log('HTTP Server listening on port ' + expressPort);
    })
  ;
});

gulp.task('watch', function() {
  server.listen(liveReloadPort, function(error) {
    if (error) {
      gutil.log(error);
    }
    gutil.log('LR Server listening on port ' + liveReloadPort);
    require('open')('http://localhost:' + expressPort + '/index.html');
  });
  gulp.watch(srcPath + '*.jade', ['build-html']);
  gulp.watch(srcPath + 'less/*.less', ['build-css']);
  gulp.watch(srcPath + 'fonts/*.ttf', ['build-fonts']);
});

gulp.task('build', ['build-html', 'build-fonts', 'build-css']);

gulp.task('default', ['clean', 'mkdir', 'build', 'server', 'watch']);
