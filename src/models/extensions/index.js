var _ = require('lodash');

/**
    methods, ext names
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