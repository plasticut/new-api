/**
    Main server module
    @module server
*/

var config = require('./config');

var express = require('express');
var colors = require('colors');

// express middleware
var morgan = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compression = require('compression');

var error = require('./middleware/error');
var models = require('./middleware/models');

var routes = require('./routes');

var passport = require('./lib/passport');
var logger = require('./lib/logger')(module);


function setupSessionStore(session, options) {
    var Store;

    // session storage
    if (options.type === 'redis') {
        Store = require('connect-redis')(session);
        return new Store(options.config);
    }
}



var app = module.exports = express();

app.set('view engine', 'jade');

// set views for error and 404 pages
app.set('views', __dirname + '/../views');

// log
if (!config.production) {
    app.use(morgan('dev'));
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
app.use(express.static(__dirname + '/../public'));

// session support
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: config.session.secret,
    store: setupSessionStore(session, config.session.store)
}));

// parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));

// initialize database
app.use(models());

// initialize passport
app.use(passport.initialize());

// deserialize user from session to req.user
app.use(passport.session());


// init routes
routes(app);

// error handler
error(app);


function start(next) {
    var http = require('http');
    var https = require('https');
    var fs = require('fs');
    var secureServer, server;
    var options = {
        key: fs.readFileSync(__dirname + '/../certs/server/my-server.key.pem'),
        cert: fs.readFileSync(__dirname + '/../certs/server/my-server.crt.pem')
    };
    var db = require('./lib/database');

    require('ssl-root-cas')
        .inject()
        .addFile(__dirname + '/../certs/server/my-root-ca.crt.pem');

    function onListenSecureServer(err) {
        if (err) {
            logger.error(('Can`t start server').red, err);
        } else {
            logger.info('Listening on https://' + secureServer.address().address + ':' + secureServer.address().port);
        }
        if (next) {
            next(err);
        }
    }

    function redirectToSecureServer(req, res) {
        res.setHeader('Location', 'https://' + req.headers.host.replace(/:\d+/, ':' + config.securePort));
        res.statusCode = 302;
        res.end();
    }

    function onListerServer(err) {
        if (err) {
            logger.error(('Can`t start server').red, err);
        } else {
            logger.info('Listening on http://' + server.address().address + ':' + server.address().port);
        }
    }

    function onDatabaseSetup(err) {
        if (err) {
            logger.error(('Can`t setup database').red, err);
            return next && next(err);
        }
        secureServer = https.createServer(options, app).listen(config.securePort, onListenSecureServer);
        server = http.createServer(redirectToSecureServer).listen(config.port, onListerServer);
    }

    var dbOptions = {
        path: __dirname + '/models',
        database: config.database
    };
    db.setup(dbOptions, onDatabaseSetup);

    return app;
}

module.exports.app = app;
module.exports.start = start;