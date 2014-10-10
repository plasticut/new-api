/**
    @module controllers/api
*/

var passport = require('passport');
var _ = require('lodash');

var logger = require('../lib/logger')(module);
var loadModules = require('../lib/load-modules');
var controllerMiddleware = require('../lib/controller-middleware');
var CRUDL = require('../lib/crudl').CRUDL;

var controllers = loadModules(__dirname + '/../controllers-api');

var crudl = new CRUDL({ middleware: controllerMiddleware });

_.each(controllers, crudl.defineController);

module.exports = [
    crudl.router
];