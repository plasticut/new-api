var logger = require('../lib/logger')(module);
var _ = require('lodash');
var uuid = require('node-uuid');
var orm = require('orm');
var extensions = require('./extensions');

exports.setup = function(db) {

    var methods = extensions('serialize', {
        generateToken: function() {
            return uuid.v4();
        }
    });

    var AccessToken = db.define('accessToken', {
        token: { type: 'text', required: true }
    }, {
        methods: methods,

        validations: {
        }
    });

    AccessToken.generateToken = methods.generateToken;

    return AccessToken;
};

exports.setupRelations = function(AccessToken, models) {

    AccessToken.hasOne('user', models.user, { required: true, reverse: 'accessTokens', autoFetch: false });
    AccessToken.hasOne('apiClient', models.apiClient, { required: true, reverse: 'accessTokens', autoFetch: false });

};