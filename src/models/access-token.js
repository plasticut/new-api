/**
    @module models/access-token
*/

var logger       = require('../lib/logger')(module);
var _            = require('lodash');
var uuid         = require('node-uuid');
var orm          = require('orm');
var extensions   = require('./extensions');
var config       = require('../config');
var errHandler   = require('err-handler');
var async        = require('async');

exports.setup = function(db) {

    var methods = extensions('serialize', 'tokens');

    var AccessToken = db.define('accessToken', {
        value: { type: 'text', required: true, unique: 'true' },
        expirationDate: {type: 'date', time: true}
    }, {
        methods: methods,

        validations: {
        }
    });

    AccessToken.generateToken = function() {
            return uuid.v4();
    };

    AccessToken.generateExpirationDate = function(){
        var expiresIn = config.accessToken.expiresIn;
        var date = new Date();
        date.setSeconds(date.getSeconds()+expiresIn);
        return date;
    };

    return AccessToken;
};

exports.setupRelations = function(AccessToken, models) {
    AccessToken.hasOne('user',         models.user,         { required: true, reverse: 'accessTokens', autoFetch: false });
    AccessToken.hasOne('apiClient',    models.apiClient,    { required: true, reverse: 'accessTokens', autoFetch: false });
};