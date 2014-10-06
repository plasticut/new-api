/**
    @module controllers/user
*/

var logger = require('../lib/logger')(module);
var handleError = require('../lib/handle-error');
var db = require('../lib/database');

module.exports = {

    before: [
    ],

    /**
        @method
        @param query {Object}
        @param model {Object}
        @param next {Function}
    */
    create: function(query, model, next){
        var User = db.models.user;

        function onCreateUser(user) {
            next(null, user);
        }

        User.create([model], handleError(next, onCreateUser));
    },

    /**
        @method
        @param id {number|string}
        @param query {Object}
        @param next {Function}
    */
    delete: function(id, query, next){
        var User = db.models.user;

        function onDeleteUser(user) {
            next();
        }

        function onGetUser(user) {
            // suppress NOT_FOUND error
            user.remove(handleError(next, onDeleteUser));
        }

        User.get(id, handleError(next, onGetUser));
    },

    /**
        @method
        @param query {Object}
        @param next {Function}
    */
    read: function(query, next){
        var User = db.models.user;

        function onGetUsers(users) {
            next(null, users);
        }

        User.find({}, handleError(next, onGetUsers));
    },

    /**
        @method
        @param id {number|string}
        @param query {Object}
        @param next {Function}
    */
    readById: function(id, query, next){
        var User = db.models.user;

        function onGetUser(user) {
            next(null, user);
        }

        User.get(id, handleError(next, onGetUser));
    },

    /**
        @method
        @param id {number|string}
        @param query {Object}
        @param model {Object}
        @param next {Function}
    */
    update: function(id, query, model, next){
        var User = db.models.user;

        function onGetUser(user) {
            user.save(model, next);
        }

        User.get(id, handleError(next, onGetUser));
    }
};
