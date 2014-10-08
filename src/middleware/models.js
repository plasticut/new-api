/**
    @module middleware/models
*/

var logger = require('../lib/logger')(module);

var database = require('../lib/database');

module.exports = function models(options) {
    return function(req, res, next) {
        req.db = database.db;
        req.models = database.models;

        next();
    };
};