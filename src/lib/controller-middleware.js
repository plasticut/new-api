/**
    @module lib/controller-middleware
*/

var logger = require('./logger')(module);
var passport = require('passport');


exports.test = function testMiddleware(req, res, next) {
    logger.info('TEST CRUDL MIDDLEWARE', req.url);
    next();
};

exports.bearer = passport.authenticate('bearer', { session: false });