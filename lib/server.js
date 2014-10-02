
var express = require('express');

// express middleware
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compression = require('compression');
var error = require('./middleware/error');
var models = require('./middleware/models');
var controllers = require('./middleware/controllers');

// session storage
var RedisStore = require('connect-redis')(session);

var colors = require('colors');

var config = require('./config');

var app = module.exports = express();

// set our default template engine to 'jade'
// which prevents the need for extensions
app.set('view engine', 'jade');

// set views for error and 404 pages
app.set('views', __dirname + '/views');

// log
if (!config.production) {
    app.use(logger('dev'));
}

// response compression
app.use(compression({
    filter: function(req, res) {
        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    }
}));

// cross origin support
app.all('*', function(req, res, next){
    if (!req.get('Origin')) { return next(); }

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    // res.set('Access-Control-Allow-Max-Age', 3600);

    if ('OPTIONS' === req.method) {
        return res.send(200);
    }

    next();
});


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
    if (!key) { return next(error(400, 'api key required')); }

    // key is invalid
    if (!~apiKeys.indexOf(key)) { return next(error(401, 'invalid api key')); }

    // store req.key for route access
    req.key = key;
    next();
});

// parse request bodies
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));


// initialize database
app.use(models({
    path: __dirname + '/models',
    database: config.database
}));

// CRUDL controllers

app.use('/api/v1', controllers({
    path: __dirname + '/controllers',
    middleware: require('./controller-middleware')
}));

// error handler
app.use(error());

function start(next) {
    app.listen(config.listen, function(err) {
        if (err) {
            console.error(('Can`t start server at localhost:' + config.listen), err);
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