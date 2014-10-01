
var express = require('express');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var accepts = require('accepts');
var RedisStore = require('connect-redis')(session);
var orm = require('orm');
var colors = require('colors');

var config = require('./config');

var app = module.exports = express();

// set our default template engine to 'jade'
// which prevents the need for extensions
app.set('view engine', 'jade');

// set views for error and 404 pages
app.set('views', __dirname + '/views');

// app.useCluster = !!module.parent;

// log
if (!config.production) {
    app.use(logger('dev'));
}

    // COMPRESSION
    // app.use(express.compress({
    //     filter: function(req, res) {
    //         return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    //     },
    //     level: 9
    // }));
    // CORS
    // app.use(function(req, res, next) {
    //     res.header('Access-Control-Allow-Origin', '*');
    //     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    //     res.header('Access-Control-Allow-Headers', 'Content-Type');

    //     next();
    // });


// serve static files
app.use(express.static(__dirname + '/public'));

// session support
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: config.session.secret,
    store: new RedisStore(config.redis)
}));

function error(status, msg) {
    var err = new Error(msg);
    err.status = status;
    return err;
}

var apiKeys = ['test-key'];

app.use('/api', function(req, res, next){
    var key = req.query['api-key'];

    // key isn't present
    if (!key) return next(error(400, 'api key required'));

    // key is invalid
    if (!~apiKeys.indexOf(key)) return next(error(401, 'invalid api key'));

    // store req.key for route access
    req.key = key;
    next();
});

// parse request bodies (req.body)
app.use(bodyParser.urlencoded({ extended: true }));

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));

app.use(orm.express(config.database, {
    define: require('./models')
}));

app.use('/api/v1', require('./crudl')({
    middleware: {
        'test': function(req, res, next) {
            console.log('TEST CRUDL MIDDLEWARE', req.url);
            next();
        }
    }
}));

require('./error')(app);


function start(next) {
    app.listen(config.listen, function(err) {
        if (err) {
            console.error(('Can`t start server at localhost:' + config.listen));
        } else {
            console.log(('Server listening on localhost:' + config.listen).green);
        }
        if (next) {
            next(err);
        }
    });
}

module.exports.app = app;
module.exports.start = start;

if (!module.parent) {
    start();
}