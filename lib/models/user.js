var logger = require('../utils/logger')(module);
var _ = require('lodash');
var orm = require('orm');
var bcrypt = require('bcrypt');

exports.setup = function(db) {

    return db.define('user', {
        name        : { type: 'text', required: true },
        surname     : { type: 'text', required: true }
    }, {
        methods: {
            serialize: function() {
                var data = _.cloneDeep(this);
                logger.info('User.serialize', data);
                return data;
            },

            fullName: function () {
                return this.name + ' ' + this.surname;
            },

            verifyPassword: function (password, next) {
                bcrypt.compare(password, this.password, next);
            },

            encryptPassword: function (password, next) {
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) { return next(err); }

                    bcrypt.hash(password, salt, next);
                });
            }
        },
        validations: {
            // age: orm.validators.rangeNumber(18, undefined, 'under-age')
        }
    });
};