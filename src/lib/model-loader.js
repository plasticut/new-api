/**
    @module lib/model-loader
*/

var logger = require('./logger')(module);
var glob = require('glob');

exports.load = function load(db, dirname, sync, next) {

    var error = false;
    var rels = glob.sync(dirname + '/*.js').reduce(function(relations, file) {
        try {
            var model = require(file);
            if (model.setupRelations) {
                relations.push([model.setupRelations, model.setup(db)]);
            } else {
                model.setup(db);
            }

        } catch(err) {
            error = true;
            logger.error('Error loading model ' + file + ':\n   '.red, err.toString());
        }
        return relations;
    }, []);

    if (error) {
        return next(new Error('Error loading models'));
    }

    rels.forEach(function(rel) {
        rel[0](rel[1], db.models);
    });

    if (sync) {
        logger.info('Start db sync...');
        db.sync(function(err) {
            if (err) {
                logger.error('Db sync error:\n   '.red, err.toString());
                return next(err);
            }
            logger.info('Db sync finished.'.green);
            next();
        });
    } else {
        next();
    }


};