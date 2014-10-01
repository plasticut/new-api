require('express-crud');

module.exports = function (options) {
    var glob = require('glob');
    var express = require('express');
    var _ = require('lodash');
    var path = require('path');

    var app = express();

    var files = _.difference(glob.sync(__dirname + '/**/*.js'), [__dirname + '/index.js']);

    var middleware = options && options.middleware || {};

    files.map(require).forEach(function(model, idx) {
        function dbForward(req, res, next) {
            model.db = req.db;
            model.models = req.models;
            next();
        }
        var name = path.basename(files[idx], '.js');
        var args = [name, dbForward];

        if (model.before) {
            args = args.concat(
                model.before.map(function(item) {
                    return (typeof item === 'string') ? middleware[item] : item;
                })
            );
        }

        args.push(model);

        app.crud.apply(app, args);
    });

    return app;
};