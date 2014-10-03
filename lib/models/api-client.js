var logger = require('../utils/logger')(module);
var _ = require('lodash');
var orm = require('orm');

exports.setup = function(db) {

    return db.define('apiClient', {
        name:        { type: 'text', required: true },
        password:    { type: 'text', required: true },
        displayName: { type: 'text', required: true }
    }, {
        methods: {
            serialize: function() {
                var data = _.cloneDeep(this);
                logger.info('ApiClient.serialize', data);
                return data;
            }
        },
        validations: {
        }
    });
};