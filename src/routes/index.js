module.exports = function(app) {

    var session = require('./session');
    var api = require('./api');
    var oauth2 = require('./oauth2');


    app.get('/', function(req, res) { res.render('index'); });
    app.get('/404', function(req, res) { res.render('404'); });
    app.get('/5xx', function(req, res) { res.render('5xx'); });

    app.post('/login', session.login);
    app.get('/logout', session.logout);

    app.get('/dialog/authorize', oauth2.authorization);
    app.post('/dialog/authorize/decision', oauth2.decision);
    app.post('/oauth/token', oauth2.token);


    // CRUDL controllers
    app.use('/api/v1', api);

};