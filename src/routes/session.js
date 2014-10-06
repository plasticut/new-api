var passport = require('passport');
var _ = require('lodash');

exports.login = [
    passport.authenticate('local', {
        // failureRedirect: '/5xx'
    }),
    function(req, res, next) {
        // res.redirect('/');
        var user = _.clone(req.user);

        delete user.password;

        console.log(require('util').inspect(user));

        res.status(200).json(user);
    }
];

exports.logout = [
    function(req, res){
        req.logout();
        res.redirect('/');
    }
];

// exports.authentificateApiClient = [
//     passport.authenticate('basic', { session: true }),
//     function(req, res){
//         req.session.logout();
//         res.redirect('/');
//     }
// ];