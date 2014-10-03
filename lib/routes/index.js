module.exports = function(app) {

    var session = require('./session');
    var api = require('./api');


    app.get('/', function(req, res) { res.render('index'); });
    app.get('/404', function(req, res) { res.render('404'); });
    app.get('/5xx', function(req, res) { res.render('5xx'); });

    app.post('/login', session.login);
    app.get('/logout', session.logout);


    // CRUDL controllers
    app.use('/api/v1', api);

};