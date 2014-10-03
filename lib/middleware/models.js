var logger = require('../utils/logger')(module);

module.exports = function(options) {
    var _ = require('lodash');
    var modelLoader = require('../utils/model-loader');
    var orm = require('orm');

    // validate all fields at once
    orm.settings.set('instance.returnAllErrors', true);

    return orm.express(options.database, {
        define: function (db, models, next) {
            modelLoader.load(db, options.path, options.database.sync, function(err) {
                if (err) { return next(err); }

                _.extend(models, db.models);

                next();
            });
        }
    });
};