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