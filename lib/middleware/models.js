var logger = require('../utils/logger')(module);


function ucfirst(text) {
    return text[0].toUpperCase() + text.substr(1);
}

module.exports = function(options) {
    var _ = require('lodash');
    var modelLoader = require('../utils/model-loader');
    var orm = require('orm');

    // validate all fields at once
    orm.settings.set('instance.returnAllErrors', true);
    orm.settings.set('properties.association_key', function(fieldName, keyName) {
        return fieldName + ucfirst(keyName);
    });

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