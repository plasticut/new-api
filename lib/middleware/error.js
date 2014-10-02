var util = require('util');
var accepts = require('accepts');
var _ = require('lodash');
var express = require('express');
var inspect = util.inspect;

function formatDefaultError(err) {
    return {
        message: err.toString(),
        status: err.status
    };
}

function formatError(err) {
    var errors = [].concat(err);

    var validationErrors = _.filter(errors, { type: 'validation' });
    var otherErrors = _.reject(errors, { type: 'validation' });

    function makeValidationError(memo, item) {
        var prop = memo[item.property] || (memo[item.property] = []);
        prop.push(item.msg);
        return memo;
    }

    errors = otherErrors.map(formatDefaultError);

    if (validationErrors.length) {
        errors.push({
            type: 'validation',
            fields: validationErrors.reduce(makeValidationError, {})
        });
    }

    return errors;
}

module.exports = function(options) {

    var app = express();

    // Render 5xx error
    app.use(function(err, req, res, next){


        var accept = accepts(req);
        var type = accept.types('html', 'json', 'text');

        if (type==='json') {
            var error = formatError(err);

            if (!app.isProduction) {
                console.log(('ERROR ' + (err.status || 500)).red, inspect(error, null, 4));
                if (err.stack) {
                    console.log(err.stack);
                }
            }

            res.status(err.status || 500).json({ error: error });
        } else {
            if (type==='html') {
                res.status(500).render('5xx');
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.status(500).end('500: Internal server error.');
            }
        }

    });

    // Render 404 error
    app.use(function(req, res, next){
        var accept = accepts(req);
        var type = accept.types('html', 'json', 'text');

        if (type==='json') {
            res.status(404).json(null);
        } else {
            if (type==='html') {
                res.status(404).render('404', { url: req.originalUrl });
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.status(404).end('404: Not Found.');
            }
        }

    });

    return app;
};