var async = require('async');
var glob = require('glob');

exports.load = function load(db, dirname, sync, next) {

    var files = glob.sync(dirname + '/**/*.js');
    async.eachSeries(files, function(file, next) {
        db.load(file, function(err) {
            if (err) {
                console.error(('Error loading model ' + file + ':\n   ' + err).red);
                return next(err);
            }
            next();
        });
    }, function(err) {

        if (err) { return next(err); }

        if (sync) {
            console.log('Start db sync...'.cyan);
            db.sync(function(err) {
                if (err) {
                    console.error(('Db sync error:' + err.toString()).red);
                    return next(err);
                }
                console.log('Db sync finished.'.green);
                next();
            });
        } else {
            next();
        }

    });

};