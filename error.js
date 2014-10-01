var util = require('util');
var accepts = require('accepts');

var inspect = util.inspect;
var toString = Object.prototype.toString;

function stringify(val) {
    var stack = val.stack;

    if (stack) {
        return String(stack);
    }

    var str = String(val);

    return str === toString.call(val)
        ? inspect(val)
        : str;
}

module.exports = function(app) {

    // Render 5xx error
    app.use(function(err, req, res, next){
        if (!app.isProduction) {
            console.error(err.stack);
        }

        var accept = accepts(req);
        var type = accept.types('html', 'json', 'text');

        if (type==='json') {
            var error = { message: err.message, status: err.status };
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
};