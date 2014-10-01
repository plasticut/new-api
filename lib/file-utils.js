var fs = require('fs');
var path = require('path');

function dir(dirname, ext) {

}

function index(dirname, ext){

    var files = {};
    ext = '.' + ext;

    fs.readdirSync(dirname)
        .filter(function(name) {
            return (name !== '.' && name !== '..' && path.extname(name) === ext);
        })
        .forEach(function(name) {
            files[path.basename(name, ext)] = path.join(dirname, name);
        });

    return files;
}


function map(dirname, ext, fn) {
    var files = index(dirname, ext);
    Object.keys(files).forEach(function(name) {
        files[name] = fn(files[name], files);
    });
    return files;
}

function contents(dirname, ext) {
    return map(dirname, ext, function(fileName) {
        return fs.readFileSync(fileName).toString();
    });
}

function clear(dirname, ext) {
    return map(dirname, ext, function(fileName) {
        fs.unlinkSync(fileName);
        return fileName;
    });
}

module.exports.index = index;
module.exports.contents = contents;
module.exports.clear = clear;
module.exports.map = map;
module.exports.dir = dir;