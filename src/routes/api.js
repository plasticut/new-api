/**
    @module routes/api
*/

var passport = require('passport');
var controllers = require('../middleware/controllers');

module.exports = [
    passport.authenticate('bearer', { session: false }),
    controllers({
        path: __dirname + '/../controllers',
        middleware: require('../lib/controller-middleware')
    })
];