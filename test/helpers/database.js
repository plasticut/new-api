var mysql = require('mysql');
var orm = require('orm');

var config = require('./config');
var path = config.pathUncovered;
var modelLoader = require(path + 'lib/model-loader');
var controllerLoader = require(path + 'lib/controller-loader');
var database = require(config.pathCovered+'lib/database')

var connectionData = {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password
};

function dropTestDb(next){
    module.exports.db.close();

    var connection = mysql.createConnection(connectionData);

    connection.connect(function(err, res) {
        if (err) { return next(err); }
        connection.query('DROP DATABASE ' + config.database.database, function(err) {
            connection.end();
            if (err) { return next(err); }

            next();
        });
    });

}

function truncateTable(tablename, next){
    module.exports.db.close();
    var connection = mysql.createConnection(connectionData);
    connection.connect(function(err, res){
        if(err){
            return next(err);
        };
        connection.query('TRUNCATE TABLE ' + config.database.database + '.' + tablename, function(err){
            connection.end();
            if(err){
                return next(err);
            }
            next();
        });
    });
}

function createTestDb(next){
    var connection = mysql.createConnection(connectionData);
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

function setupTestDb(next){
    createTestDb(function(){
        var dbOptions = {
            path: path + 'models',
            database: config.database,
            debug: false
        };
        database.setup(dbOptions, null, function(err){
            next(database);
        });

    })
}

module.exports = {
    db: null,
    drop: dropTestDb,
    create: createTestDb,
    setup: setupTestDb,
    truncate: truncateTable
};