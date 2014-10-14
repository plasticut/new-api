var orm = require('orm');
process.env.NODE_ENV = 'test';
var config = require('./config');
var path = config.pathUncovered;
var modelLoader = require(path + 'lib/model-loader');
var database = require(config.pathCovered+'lib/database');


var connectionData = {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password
};

function dropTestDb(next){
    database.db.drop(next);
}

function truncateTable(tablename, next){
    database.db.driver.execQuery('TRUNCATE TABLE ' + config.database.database + '.' + tablename, function(err){
        if(err){
            return next(err);
        }
        next();
    });
}


function setupTestDb(next){
    var dbOptions = {
        path: path + 'models',
        database: config.database,
        debug: false
    };
    database.setup(dbOptions, null, function(err){
        next(database);
    });
}

module.exports = {
    db: null,
    drop: dropTestDb,
    setup: setupTestDb,
    truncate: truncateTable
};