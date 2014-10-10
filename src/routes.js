/**
    @module routes/index
*/

var logger = require('./lib/logger')(module);

module.exports = function(app) {
    var controller = require('./lib/load-modules')(__dirname + '/controllers');

    app.get('/',    controller.site.index);
    app.get('/404', controller.site['404']);
    app.get('/5xx', controller.site['5xx']);

    app.post('/login', controller.session.login);
    app.get('/logout', controller.session.logout);

    app.get('/dialog/authorize', controller.oauth2.authorization);
    app.post('/dialog/authorize/decision', controller.oauth2.decision);
    app.post('/oauth/token', controller.oauth2.token);

    // CRUDL controllers
    app.use('/api/v1', controller.api);

    // console.log(app._router.stack);
};