var orm = require('orm');
var config = require('./config');
var path = config.pathUncovered;
var modelLoader = require(path + 'lib/model-loader');
var database = require(config.pathCovered+'lib/database');
var async = require('async');


var connectionData = {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password
};

function dropTestDb(next){
    database.db.drop(next);
}

function truncateTable(tablenames, next){
    var query = function(tablename){
        return 'TRUNCATE TABLE ' + config.database.database + '.' + tablename;
    };

    var q = async.queue(function(tablename, callback){
        database.db.driver.execQuery(query(tablename), callback)
    }, tablenames.length);

    q.drain = function(err){
        next(err);
    };

    q.push(tablenames, function(err){
        if(err){
            q.kill();
            if(typeof(arr)=='Array'){
                next(err[0]);
            }else{
                next(err);
            }

        }
    });
}


function setupTestDb(next){
    var dbOptions = {
        path: path + 'models',
        database: config.database,
        debug: false
    };
    database.setup(dbOptions, null, function(err){
        next(err, database);
    });
}

module.exports = {
    db: null,
    drop: dropTestDb,
    setup: setupTestDb,
    truncate: truncateTable
};