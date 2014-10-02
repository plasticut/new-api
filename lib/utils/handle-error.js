var orm = require('orm');

module.exports = function handleErrorWrapper(next, fn) {
    return function handleError(err, res) {
        if (err) {
            if (err.name === 'ORMError' && err.code === orm.ErrorCodes.NOT_FOUND) {
                return next();
            } else {
                return next(err);
            }
        }
        fn(res);
    };
};