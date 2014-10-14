/**
    @module lib/load-modules
*/

var glob = require('glob');
var path = require('path');

function dash(s) {
    return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

module.exports = function load(dirname, options) {
    var processName = options && options.processName || dash;
    return []
        .concat(path.resolve(dirname) )
        .reduce(function(memo, name) { return memo.concat(glob.sync(name + '/**/*.js')); }, [])
        .reduce(function(memo, filename) {
            memo[processName(path.basename(filename, '.js'))] = require(filename);
            return memo;
        }, {});

};