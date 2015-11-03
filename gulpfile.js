var gulp = require('gulp');
var karma = require('karma').server;

gulp.task('test', function(done) {
    karma.start({
        configFile: __dirname + '/dateClient/www/test/my.conf.js',
        singleRun: true,
        browsers: ["PhantomJS"]
    }, function(result) {
        //return result
        done(result);

    })
});

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var usemin = require('gulp-usemin');
var rimraf = require('gulp-rimraf');
var replace = require('gulp-replace');

 
gulp.task('compress', function() {
  return gulp.src(['dateClient/www/js/*.js', 'dateClient/www/js/controllers/*.js' ])
    .pipe(concat('concat.js'))
    .pipe(gulp.dest('dateClient/www/js/dist'))
    .pipe(rename('uglify.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dateClient/www/js/dist'));
});

gulp.task('minify', function() {
    return gulp.src('dateClient/www/index.html')
        .pipe(usemin({
            assetsDir: 'dateClient/www/',
            js: [uglify(), 'concat']
        }))
        .pipe(gulp.dest('dateClient/www/'));
});


gulp.task('fix-template', ['minify'], function() {
    return gulp.src('dateClient/www/js/dist/index.html')
        .pipe(rimraf())
        .pipe(rename("index.html"))
        .pipe(gulp.dest('dateClient/www'));
});


gulp.task('default', ['minify', 'fix-template']);

gulp.task('clean', function() {
    var generated = ['public/js/site.js', 'dateClient/www/index.html'];
    return gulp.src(generated)
        .pipe(rimraf());
});

