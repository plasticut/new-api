var orm = require('orm');

module.exports = function(db, done) {

    db.define('user', {
        name      : { type: 'text', required: true },
        surname   : { type: 'text', required: true },
        age       : Number,
        male      : Boolean,
        continent : [ 'Europe', 'America', 'Asia', 'Africa', 'Australia', 'Antartica' ], // ENUM type
        photo     : Buffer, // BLOB/BINARY
        data      : Object // JSON encoded
    }, {
        methods: {
            fullName: function () {
                return this.name + ' ' + this.surname;
            }
        },
        validations: {
            age: orm.validators.rangeNumber(18, undefined, 'under-age')
        }
    });

    done();

};