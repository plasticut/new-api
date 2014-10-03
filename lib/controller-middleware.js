var logger = require('./utils/logger')(module);

module.exports = {
    'test': function(req, res, next) {
        logger.info('TEST CRUDL MIDDLEWARE', req.url);
        next();
    }
};