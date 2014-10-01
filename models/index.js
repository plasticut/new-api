var async = require('async');
var _ = require('lodash');

var fu = require('../lib/file-utils');
var glob = require('glob');

module.exports = function (db, models, next) {

    var config = require('../config');

    var files = _.difference(glob.sync(__dirname + '/**/*.js'), [__dirname + '/index.js']);
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

        _.extend(models, db.models);

        if (config.database.sync) {
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