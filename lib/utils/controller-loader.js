var glob = require('glob');
var _ = require('lodash');
var path = require('path');

function controllerAttach(controller, db) {
    controller.db = db;
    _.extend(controller.models, db.models);
}

exports.load = function load(dirname) {
    dirname = path.resolve(dirname);
    console.log('load controller', dirname);
    return glob
        .sync(dirname + '/**/*.js')
        .reduce(function(memo, filename) {
            var controller = require(filename);

            controller.attach = _.partial(controllerAttach, controller);

            memo[path.basename(filename, '.js')] = controller;
            return memo;
        }, {});

};