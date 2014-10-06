var _ = require('lodash');
var config = require('./config');
var controllerLoader = require(config.pathUncovered + 'lib/controller-loader');

var controllers = controllerLoader.load(config.pathCovered + 'controllers');

module.exports = _.clone(controllers);

module.exports.attach = function(database) {
    _.forEach(controllers, function(controller) {
        controller.attach(database.db);
    });
};