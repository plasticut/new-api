var startDate = new Date();
var pkg = require('../../package.json');

module.exports = {
    'index': function(req, res) {
        res.render('index', {
            name: pkg.name,
            version: pkg.version,
            start: startDate,
            uptime: Math.round(((new Date()).getTime() - startDate.getTime()) / 1000)
        });
    },

    '404': function(req, res) {
        res.render('404');
    },

    '5xx': function(req, res) {
        res.render('5xx');
    }
};