/**
    @module models/extensions/index
*/

var _ = require('lodash');

/**
    @method
    @param {...(string|Object)} module Name or object with methods
    @return {Object} Object with methods
*/
function setupExtensions() {

    var arr = Array.prototype.slice.call(arguments, 0);

    arr = arr.map(function(name) {
        if (typeof name === 'string') {
            return require('./' + name);
        } else {
            return name;
        }
    });

    return _.extend.apply(_, arr);
}

module.exports = setupExtensions;