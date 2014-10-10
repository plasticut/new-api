/**
    @module routes/oauth2
*/

var db = require('../lib/database'),
    login = require('connect-ensure-login'),
    logger = require('../lib/logger')(module),
    oauth2 = require('../lib/oauth2'),
    passport = require('passport');

// user authorization endpoint
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request.  In
// doing so, is recommended that the `redirectURI` be checked against a
// registered value, although security requirements may vary accross
// implementations.  Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectURI` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view.
exports.authorization = [
    login.ensureLoggedIn(),
    oauth2.authorization(function(clientID, redirectURI, next) {
        logger.info('OAuth.authorization', clientID, redirectURI);

        var ApiClient = db.models.apiClient;

        function onFindApiClient(err, apiClients) {
            if (err) { return next(err); }

            var apiClient = apiClients && apiClients[0];

            // WARNING: For security purposes, it is highly advisable to check that
            //          redirectURI provided by the client matches one registered with
            //          the server.  For simplicity, this example does not.  You have
            //          been warned.
            return next(null, apiClient, redirectURI);
        }

        ApiClient.find({ name: clientID }, onFindApiClient);
    }),
    function(req, res){
        res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
    }
];


// user decision endpoint
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.
exports.decision = [
    login.ensureLoggedIn(),
    oauth2.decision()
];


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    oauth2.token(),
    oauth2.errorHandler()
];