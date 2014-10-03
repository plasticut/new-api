
var passport = require('passport');

exports.login = [
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    }
];

exports.logout = [
    function(req, res){
        req.logout();
        res.redirect('/');
    }
];