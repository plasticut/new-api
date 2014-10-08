var dbm = require('db-migrate');
var async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
    async.series([
        function(callback){
            db.createTable('hand', {
                id: { type: 'int', primaryKey: true }
            }, callback);
        },
        function(callback){
            db.addColumn('hand', 'is_left',
            {
                type: 'boolean'
            },callback);
        }
    ], callback);
};

exports.down = function(db, callback) {
    db.dropTable('hand', callback);
};


