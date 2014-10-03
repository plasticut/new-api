var logger = require('../utils/logger')(module);
var _ = require('lodash');
var uuid = require('node-uuid');
var orm = require('orm');

exports.setup = function(db) {

    return db.define('accessToken', {
        token: { type: 'text', required: true }
    }, {
        methods: {
            serialize: function() {
                var data = _.cloneDeep(this);
                logger.info('AccessToken.serialize', data);
                return data;
            },

            generateToken: function() {
                return uuid.v4();
            }
        },
        validations: {
        }
    });
};

exports.setupRelations = function(accessToken, models) {

    accessToken.hasOne('user', models.user, { required: true, reverse: 'accessTokens', autoFetch: false });
    accessToken.hasOne('apiClient', models.apiClient, { required: true, reverse: 'accessTokens', autoFetch: false });

};