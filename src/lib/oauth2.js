/**
 * Module dependencies.
 */
var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    login = require('connect-ensure-login'),
    database = require('./database'),
    logger = require('./logger')(module);

// create OAuth 2.0 server
var server = oauth2orize.createServer();

module.exports = server;

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.
server.serializeClient(function(client, next) {
    logger.info('OAuth.serializeClient', client);
    return next(null, client.id);
});

server.deserializeClient(function(id, next) {
    logger.info('OAuth.deserializeClient', id);

    var ApiClient = database.models.apiClient;

    ApiClient.get(id, function(err, client) {
        if (err) { return next(err); }

        return next(null, client);
    });
});


// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, next) {
    logger.info('oauth2orize.grant.code', client, redirectURI, user, ares);

    var AuthorizationCode = database.models.authorizationCode;

    AuthorizationCode.create({
        code: AuthorizationCode.generateCode(), // uid(16)
        apiclientId: client.id,
        userId: user.id,
        redirectURI: redirectURI
    }, function(err, authorizationCode) {
        if (err) { return next(err); }

        next(null, authorizationCode.code);
    });
}));


// Grant implicit authorization.  The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a token, which is bound to these
// values.
server.grant(oauth2orize.grant.token(function(client, user, ares, next) {
    logger.info('oauth2orize.grant.token', client, user, ares);

    var AccessToken = database.models.accessToken;

    var token = AccessToken.generateToken(); // uid(256)

    AccessToken.create({
        token: token,
        userId: user.id,
        apiclientId: client.id
    }, function(err) {
        if (err) { return next(err); }

        next(null, token);
    });
}));


// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, next) {
    logger.info('oauth2orize.exchange.token', client, code, redirectURI);

    var AuthorizationCode = database.models.authorizationCode;
    var AccessToken = database.models.accessToken;

    AuthorizationCode.find({ code: code }, function(err, authCode) {
        if (err) { return next(err); }

        if (client.id !== authCode.apiclientId) { return next(null, false); }
        if (redirectURI !== authCode.redirectURI) { return next(null, false); }

        var token = AccessToken.generateToken(); // uid(256)

        AccessToken.create({
            token: token,
            userId: authCode.userId,
            apiclientId: authCode.apiclientId
        }, function(err) {
            if (err) { return next(err); }

            next(null, token);
        });
    });
}));


// Exchange user id and password for access tokens.  The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, next) {
    logger.info('oauth2orize.exchange.password', client, username, password, scope);

    var ApiClient = database.models.apiClient;
    var AccessToken = database.models.accessToken;
    var User = database.models.user;

    var user, apiClient;

    function onCreateToken(err, accessToken) {
        if (err) { return next(err); }

        next(null, accessToken.token);
    }

    function onVerifyUserPassword(err, valid) {
        if (err) { return next(err); }
        if (!valid) { return next(null, false); }

        //Everything validated, return the token
        AccessToken.create({
            token: AccessToken.generateToken(), // uid(256)
            userId: user.id,
            apiclientId: apiClient.id
        }, onCreateToken);
    }

    function onFindUser(err, users) {
        if (err) { return next(err); }

        user = users && users[0];
        if (!user) { return next(null, false); }

        user.verifyPassword(password, onVerifyUserPassword);
    }

    function onVerifyApiClientPassword(err, valid) {
        if (!valid) { return next(null, false); }

        //Validate the user
        User.find({ username: username }, onFindUser);
    }

    function onFindApiClient(err, apiClients) {
        if (err) { return next(err); }

        apiClient = apiClients && apiClients[0];

        if (apiClient === null) { return next(null, false); }

        apiClient.verifyPassword(client.password, onVerifyApiClientPassword);
    }

    // clientId ?
    ApiClient.find({ name: client.name }, onFindApiClient);
}));


// Exchange the client id and password/secret for an access token.  The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.
server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, next) {
    logger.info('oauth2orize.exchange.clientCredentials', client, scope);

    var ApiClient = database.models.apiClient;
    var AccessToken = database.models.accessToken;

    var apiClient;

    function onCreateToken(err, accessToken) {
        if (err) { return next(err); }

        next(null, accessToken.token);
    }

    function onVerifyApiClientPassword(err, valid) {
        if (err) { return next(err); }
        if (!valid) { return next(null, false); }

        //Pass in a null for user id since there is no user with this grant type
        AccessToken.create({
            token: AccessToken.generateToken(), // uid(256)
            userId: null,
            apiclientId: apiClient.id
        }, onCreateToken);
    }

    function onFindApiClient(err, apiClients) {
        if (err) { return next(err); }

        apiClient = apiClients && apiClients[0];

        if (apiClient === null) { return next(null, false); }

        apiClient.verifyPassword(client.password, onVerifyApiClientPassword);
    }

    // clientId ?
    ApiClient.find({ name: client.name }, onFindApiClient);
}));