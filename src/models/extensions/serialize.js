var logger = require('../../lib/logger')(module);
var _ = require('lodash');

module.exports = {
    serialize: function(all) {
        var data = _.cloneDeep(this);

        if (!all) {
            this.clean(data, this.getRestrictedFields);
        }

        logger.info('serialize', data);

        return data;
    },

    clean: function(data, getRestrictedFields) {
        [].concat(_.result(getRestrictedFields)).forEach(function (field) {
            delete data[field];
        });
        return data;
    }
};