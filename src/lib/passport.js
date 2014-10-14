/**
    @module lib/passport
*/

var logger = require('./logger')(module);

function setup(passport) {
    var LocalStrategy = require('passport-local').Strategy;
    var BasicStrategy = require('passport-http').BasicStrategy;
    var BearerStrategy = require('passport-http-bearer').Strategy;
    var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

    function serializeUser(req, user, next) {
        logger.info('serializeUser', user.id);

        next(null, user.id);
    }

    function deserializeUser(req, id, next) {
        logger.info('deserializeUser', id);

        req.models.user.find({ id: id }, function(err, users){
            if (err) { return next(err); }

            var user = users && users[0];

            next(null, user.serialize());
        });

    }

    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);

    /**
        CONFIGURE BASIC STRATEGY
    */
    function basicStrategyHandler(req, clientId, password, next) {
        var ApiClient = req.models.apiClient;

        logger.info('basicStrategyHandler', clientId, password);

        ApiClient.find({ name: clientId }, function(err, apiClients) {
            console.log('1.basicStrategyHandler', err, apiClients);
            if (err) { return next(err); }

            var client = apiClients && apiClients[0];

            if (!client) { return next(null, false); }

            client.verifyPassword(password, function(err, equal) {
                if (err) { return next(err); }
                if (!equal) { return next(null, false); }

                next(null, client.serialize());
            });
        });
    }

    var basicOptions = {
        passReqToCallback: true
    };

    passport.use(new BasicStrategy(basicOptions, basicStrategyHandler));

    /**
        CONFIGURE OAUTH2 CLIENT PASSWORD STRATEGY
    */
    function clientPasswordStrategyHandler(req, clientId, password, next) {
        logger.info('clientPasswordStrategyHandler', clientId, password, 'xxx');

        req.models.apiClient.find({ name: clientId }, function(err, apiClients) {
            logger.info('1.clientPasswordStrategyHandler', err, apiClients);

            if (err) { return next(err); }

            var client = apiClients && apiClients[0];

            if (!client) { return next(null, false); }

            client.verifyPassword(password, function(err, equal) {
                if (err) { return next(err); }
                if (!equal) { return next(null, false); }

                next(null, client.serialize());
            });
        });
    }

    var clientPasswordOptions = {
        passReqToCallback: true
    };

    passport.use(new ClientPasswordStrategy(clientPasswordOptions, clientPasswordStrategyHandler));

    /**
        CONFIGURE LOCAL STRATEGY
    */
    function localStrategyHandler(req, username, password, next) {
        logger.info('localStrategyHandler', username);

        req.models.user.find({ username: username }, function(err, users) {
            if (err) { return next(err); }

            var user = users && users[0];

            if (!user) { return next(null, false); }

            user.verifyPassword(password, function(err, equal) {
                if (err) { return next(err); }
                if (!equal) { return next(null, false); }

                next(null, user.serialize());
            });
        });
    }

    var localOptions = {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    };

    passport.use(new LocalStrategy(localOptions, localStrategyHandler));


    /**
        CONFIGURE BEARER STRATEGY
    */
    function bearerStrategyHandler(req, accessToken, next) {
        logger.info('bearerStrategyHandler', accessToken);

        req.models.accessToken.find({ value: accessToken }, function(err, tokens) {
            if (err) { return next(err); }

            var token = tokens && tokens[0];
            if (!token) {
                return next(null, false, {message: 'invalid access token'});
            }
            if(token.expired()){
                return next(null, false, {message: 'expired access token'});
            }
            req.models.user.find({id: token.userId}, function(err, users){
                var user = users && users[0];
                if(!user) { return next(null,false); }
                user.save({ accessDate: new Date() }, function(err, user) {
                    if (err) { return next(err); }
                    next(null, user.serialize());
                });
            });
        });
    }

    var bearerOptions = {
        passReqToCallback: true
    };

    passport.use(new BearerStrategy(bearerOptions, bearerStrategyHandler));

    return passport;
}

module.exports = setup(require('passport'));