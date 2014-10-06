var glob = require('glob');
var _ = require('lodash');
var path = require('path');

function controllerAttach(controller, db) {
    controller.db = db;
    _.extend(controller.models, db.models);
}

function dash(s) {
    return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

exports.load = function load(dirname) {
    dirname = path.resolve(dirname);

    return glob
        .sync(dirname + '/**/*.js')
        .reduce(function(memo, filename) {
            var controller = require(filename);

            controller.attach = _.partial(controllerAttach, controller);

            memo[dash(path.basename(filename, '.js'))] = controller;
            return memo;
        }, {});

};