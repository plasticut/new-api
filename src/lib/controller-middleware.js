var logger = require('./logger')(module);

module.exports = {
    'test': function(req, res, next) {
        logger.info('TEST CRUDL MIDDLEWARE', req.url);
        next();
    }
};