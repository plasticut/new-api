var mysql = require('mysql');
var orm = require('orm');

var config = require('./config');
var modelLoader = require(config.pathUncovered + 'lib/model-loader');
var controllerLoader = require(config.pathUncovered + 'lib/controller-loader');

function dropTestDb(next){
    module.exports.db.close();

    var connection = mysql.createConnection({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password
    });

    connection.connect(function(err, res) {
        if (err) { return next(err); }

        connection.query('DROP DATABASE ' + config.database.database, function(err) {
            connection.end();

            if (err) { return next(err); }

            next();
        });
    });

}

function createTestDb(next){

    var connection = mysql.createConnection({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password
    });

    connection.connect(function(err, res) {
        if (err) { return next(err); }

        connection.query('CREATE DATABASE IF NOT EXISTS ' + config.database.database, function(err) {
            connection.end();

            if (err) { return next(err); }

            orm.connect(config.database, function(err, db) {
                if (err) { return next(err); }

                modelLoader.load(db, config.pathCovered + 'models', true, function(err) {
                    if (err) { return next(err); }

                    module.exports.db = db;

                    next();
                });
            });
        });
    });

}

module.exports = {
    db: null,
    drop: dropTestDb,
    create: createTestDb
};