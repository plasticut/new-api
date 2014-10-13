/**
    @module lib/database
*/

var logger = require('./logger')(module),
    modelLoader = require('./model-loader'),
    _ = require('lodash'),
    orm = require('orm');

function ucfirst(text) {
    return text[0].toUpperCase() + text.substr(1);
}


function createDefaults(defaults, models, next) {
    var apiClientData = defaults.apiClient;
    var userData = defaults.user;
    var accessTokenData = defaults.accessToken;

    var ApiClient = models.apiClient;
    var User = models.user;
    var AccessToken = models.accessToken;

    function onCreateAccessToken(err, accessToken) {
        if (err) { return next(err); }
        next();
    }

    function onCreateUser(err, user) {
        if (err) { return next(err); }
        accessTokenData.userId = user.id;

        AccessToken.create(accessTokenData, onCreateAccessToken);
    }

    function onEncryptPasswordUser(err, password) {
        if (err) { return next(err); }

        userData.password = password;
        User.create(userData, onCreateUser);

    }

    function onCreateApiClient(err, apiClient) {
        if (err) { return next(err); }

        accessTokenData.apiclientId = apiClient.id;

        User.encryptPassword(userData.password, onEncryptPasswordUser);
    }

    function onEncryptPasswordApiClient(err, password) {
        if (err) { return next(err); }

        apiClientData.password = password;

        ApiClient.create(apiClientData, onCreateApiClient);
    }

    function onExistsApiClient(err, exists) {
        if (err) { return next(err); }

        if (exists) { return next(); }

        logger.info('Create database defaults');
        ApiClient.encryptPassword(apiClientData.password, onEncryptPasswordApiClient);
    }

    ApiClient.exists({ name: apiClientData.name }, onExistsApiClient);

} // createDefaults

function setupDatabase(options, defaults, next) {
    orm.connect(options.database, function (err, db) {
        if (err) { return next(err); }
        exports.db = db;

        modelLoader.load(db, options.path, options.database.sync, function(err) {
            if (err) { return next(err); }

            exports.models = db.models;
            if(defaults){
                createDefaults(defaults, db.models, next);
            }else{
                next();
            }
        });

    });

}

// validate all fields at once
orm.settings.set('instance.returnAllErrors', true);

// change relative key naming style
orm.settings.set('properties.association_key', function(fieldName, keyName) {
    return fieldName + ucfirst(keyName);
});

exports.setup = setupDatabase;