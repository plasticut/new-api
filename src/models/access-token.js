/**
    @module models/access-token
*/

var logger = require('../lib/logger')(module);
var _ = require('lodash');
var uuid = require('node-uuid');
var orm = require('orm');
var extensions = require('./extensions');
var config = require('../config');

exports.setup = function(db) {

    var methods = extensions('serialize', {
        expired: function(){
            return this.expirationDate < new Date();
        },
    });

    var AccessToken = db.define('accessToken', {
        value: { type: 'text', required: true },
        refreshToken: {type: 'text', required: true},
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
        var expiresIn = config.token.expiresIn;
        var date = new Date();
        date.setSeconds(date.getSeconds()+expiresIn);
        return date;
    };

    //Не работает
    AccessToken.clearRefresh = function(refreshToken){
        AccessToken.find({refreshToken: refreshToken}, function(err, tokens){
            tokens.forEach(function(token){
                token.delete();
            })
        })
    };

    return AccessToken;
};

exports.setupRelations = function(AccessToken, models) {
    AccessToken.hasOne('user',         models.user,         { required: true, reverse: 'accessTokens', autoFetch: false });
    AccessToken.hasOne('apiClient',    models.apiClient,    { required: true, reverse: 'accessTokens', autoFetch: false });
};