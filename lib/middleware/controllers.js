
module.exports = function (options) {
    var express = require('express');
    var controllerLoader = require('../utils/controller-loader');
    var _ = require('lodash');

    require('express-crud');

    var app = express();

    var controllers = controllerLoader.load(options.path);

    _.each(controllers, function(controller, name) {
        function dbForward(req, res, next) {
            controller.attach(req.db);
            next();
        }

        var args = [name, dbForward];

        if (controller.before) {
            args = args.concat(
                controller.before.map(function(item) {
                    return (typeof item === 'string') ? options.middleware[item] : item;
                })
            );
        }

        args.push(controller);

        app.crud.apply(app, args);
    });

    return app;
};
