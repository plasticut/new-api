module.exports = {
    'test': function(req, res, next) {
        console.log('TEST CRUDL MIDDLEWARE', req.url);
        next();
    }
};