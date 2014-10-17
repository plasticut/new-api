/**
 Sasha Zhuravlev 15.10.14.
 */
var logger       = require('../lib/logger')(module);
var _            = require('lodash');
var uuid         = require('node-uuid');
var orm          = require('orm');
var extensions   = require('./extensions');
var config       = require('../config');
var errHandler   = require('err-handler');
var async        = require('async');

exports.setup = function(db){
    var methods = extensions('serialize', 'tokens');
    var RefreshToken = db.define('refreshToken', {
        value: { type: 'text', required: true, unique: true },
        expirationDate: {type: 'date', time: true}
    });


    RefreshToken.generateExpirationDate = function(){
        var expiresIn = config.refreshToken.expiresIn;
        var date = new Date();
        date.setSeconds(date.getSeconds()+expiresIn);
        return date;
    };

    RefreshToken.generateToken = function() {
        return uuid.v4();
    };

    return RefreshToken;
}

exports.setupRelations = function(RefreshToken, models) {
    RefreshToken.hasOne('apiClient', models.apiClient, { required: true, reverse: 'refreshTokens', autoFetch: false });
    RefreshToken.hasOne('user',      models.user,     { required: true, reverse: 'refreshTokens', autoFetch: false });
};
