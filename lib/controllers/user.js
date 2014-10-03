/**
    @module controllers/user
*/
var logger = require('../utils/logger')(module);
var models = {}; // automatically mounts on module load
var handleError = require('../utils/handle-error');

module.exports = {

    models: models,

    before: [
    ],

    /**
        @function create
    */
    create: function(query, model, next){

        function onCreateUser(user) {
            next(null, user);
        }

        models.user.create([model], handleError(next, onCreateUser));
    },

    /**
        @function delete
    */
    delete: function(id, query, next){

        function onDeleteUser(user) {
            next();
        }

        function onGetUser(user) {
            // suppress NOT_FOUND error
            user.remove(handleError(next, onDeleteUser));
        }

        models.user.get(id, handleError(next, onGetUser));
    },

    /**
        @function read
    */
    read: function(query, next){

        function onGetUsers(users) {
            next(null, users);
        }

        models.user.find({}, handleError(next, onGetUsers));
    },

    /**
        @function readById
    */
    readById: function(id, query, next){

        function onGetUser(user) {
            next(null, user);
        }

        models.user.get(id, handleError(next, onGetUser));
    },

    /**
        @function update
    */
    update: function(id, query, model, next){

        function onGetUser(user) {
            user.save(model, next);
        }

        models.user.get(id, handleError(next, onGetUser));
    }
};
