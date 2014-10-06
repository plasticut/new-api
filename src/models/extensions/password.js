var bcrypt = require('bcrypt');

module.exports = {
    verifyPassword: function (password, next) {
        bcrypt.compare(password, this.password, next);
    },

    encryptPassword: function (password, next) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) { return next(err); }

            bcrypt.hash(password, salt, next);
        });
    }
};