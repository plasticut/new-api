var logger = require('../lib/logger')(module);
var _ = require('lodash');
var orm = require('orm');
var extensions = require('./extensions');

exports.setup = function(db) {

    var methods = extensions('serialize', 'password', {
        fullName: function () {
            return this.name + ' ' + this.surname;
        }
    });

    var User = db.define('user', {
        name        : { type: 'text', required: true },
        surname     : { type: 'text', required: false },

        userName    : { type: 'text', required: true, unique: true },
        password    : { type: 'text', required: true }
    }, {
        methods: methods,

        validations: {
            // age: orm.validators.rangeNumber(18, undefined, 'under-age')
        }
    });

    User.encryptPassword =  methods.encryptPassword;

    return User;
};