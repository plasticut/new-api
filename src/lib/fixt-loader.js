var fs = require('fs');
var path = require('path');
var async = require('async');

var isJSON = function(filePath){
      return path.extname(filePath) === '.json';
};

function FixtLoader (db){
    this.db = db;
}

module.exports = FixtLoader;



FixtLoader.prototype.fromObject = function(obj, done){
    var model = this.db.models[obj.model];
    if(!model){
        done(new Error('model '+ obj.model + ' does not exists'));
        return;
    }
    model.create(obj.data, done);
};



FixtLoader.prototype.fromFile = function(filepath, done){
    var self = this;
    if(!fs.existsSync(filepath)){
        return done(new Error('file ' + filepath+ ' does not exists'));
    };
    var stats = fs.statSync(filepath);
    if(!stats.isFile()){
        return done(new Error(filepath + ' is not a file'));
    }
    if(!isJSON(filepath)){
        return done(new Error (filepath + ' is not json file'));
    }
    var objects = require(filepath);

    this.fromArray(objects, done);
};

FixtLoader.prototype.fromArray = function(array, done){
    var self = this;
    var inserted = [];
    var q = async.queue(function(object, callback){
        self.fromObject(object, function(err, data){
            if(err){
                return callback(err);
            }
            inserted.push(data);
            callback();
        })
    }, array.length)

    q.drain = function(err){
        done(err, inserted);
    };
    q.push(array, function(err){
        if(err){
            q.kill();
            done(err, inserted);
        }
    });
}



FixtLoader.prototype.fromFolder = function(folderpath, done){
    var self = this;
    if(!fs.existsSync(folderpath)){
        return done(new Error('file' + folderpath+ ' does not exists'));
    };

    var stats = fs.statSync(folderpath);
    if(!stats.isDirectory()){
        return done(new Error(folderpath + ' is not a folder'));
    }
    var inserted =[];
    var files = fs.readdirSync(folderpath).filter(isJSON);
    var q = async.queue(function(file, callback){
        self.fromFile(folderpath + '/' + file, function(err, data){
            if(err){
                return callback(err);
            }
            inserted = inserted.concat(data);
            callback();
        })
    }, files.length);

    q.drain = function(err){
        done(err, inserted)
    };

    q.push(files, function(err){
        if(err){
            q.kill();
            done(err, inserted);
        }
    });

}






