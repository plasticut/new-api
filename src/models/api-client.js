var logger = require('../lib/logger')(module);
var _ = require('lodash');
var orm = require('orm');
var bcrypt = require('bcrypt');
var extensions = require('./extensions');

exports.setup = function(db) {

    var methods = extensions('serialize', 'password');

    var ApiClient = db.define('apiClient', {
        name:        { type: 'text', required: true, unique: true },
        password:    { type: 'text', required: true },
        displayName: { type: 'text', required: true }
    }, {
        methods: methods,

        validations: {
        }
    });

    ApiClient.encryptPassword = methods.encryptPassword;

    return ApiClient;
};