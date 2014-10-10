/**
    @module lib/crudl
*/

var async = require('async');
var paramRegx = /\/:([^\/]+)$/;
var express = require('express');
var orm = require('orm');
var _ = require('lodash');

function errHandler(next, fn, res) {
    return function handleError(err, data) {
        // SUPPRESS NOT FOUND ERROR
        if (err) {
            if (err.name === 'ORMError' && err.code === orm.ErrorCodes.NOT_FOUND) {
                return next();
            } else {
                return next(err);
            }
        }
        fn(data, res);
    };
}

function onDeleteSingle(data, res){
    if (data) {
        res.status(200).json(data);
    } else {
        res.status(204).json(null);
    }
}

function onDeleteMulti(data, res) {
    res.status(200).json(data);
}

function handlerDelete(resource, param, req, res, next) {
    var ctx = this;

    var ids = req.params[param].split(',');
    var query = req.query;

    if (ids.length === 1) {
        resource.delete.call(ctx, ids[0], query, errHandler(next, onDeleteSingle, res));
    } else {
        var tasks = ids.map(function(id){
            return resource.delete.bind(ctx, id, query);
        });
        async.parallel(tasks, errHandler(next, onDeleteMulti, res));
    }
}

function onRead(data, res) {
    if (Array.isArray(data)) {
        res.status(200).json(data);
    } else {
        res.status(204).json(null);
    }
}

function handlerRead(resource, req, res, next){
    var ctx = this;

    resource.read.call(ctx, req.query, errHandler(next, onRead, res));
}

function onReadByIds(data, res) {
    res.status(200).json(data);
}

function onReadById(data, res) {
    if (data) {
        res.status(200).json(data);
    } else {
        res.status(204).json(null);
    }
}

function handlerReadById(resource, param, req, res, next){
    var ctx = this;

    var ids = req.params[param].split(',');
    var query = req.query;

    var tasks = ids.map(function(id) {
        return resource.readById.bind(ctx, id, query);
    });

    if (tasks.length === 1) {
        return tasks[0](errHandler(next, onReadById, res));
    }

    async.parallel(tasks, errHandler(next, onReadByIds, res));
}

function onCreate(data, res){
    if (data) {
        res.status(200).json(data);
    } else {
        res.status(204).json(null);
    }
}

function handlerCreate(resource, req, res, next){
    var ctx = this;

    resource.create.call(ctx, req.query, req.body, errHandler(next, onCreate, res));
}

function onUpdate(data, res) {
    if (data) {
        res.status(200).json(data);
    } else {
        res.status(204).json(null);
    }
}

function handlerUpdate(resource, param, req, res, next){
    var ctx = this;

    var id = req.params[param];
    var query = req.query;
    var body = req.body;

    resource.update.call(ctx, id, query, body, errHandler(next, onUpdate, res));
}

/**
    @class
*/

function CRUDL(options) {
    this.middleware = options.middleware || {};
    this.router = new express.Router();
    this.ctx = options.ctx || {};

    var _this = this;
    this.defineController = function defineController(controller, name) {
        _this.define(name, [], controller);
    };
}

module.exports.CRUDL = CRUDL;

CRUDL.prototype.expandMiddleware = function(middleware) {
    var _this = this;
    return middleware.map(function(item) {
        if (typeof item === 'string') {
            var found =  _this.middleware[item];
            if (found) {
                return found;
            }
            throw new Error('Unknown middleware ' + item);
        }
        return item;
    });
};

CRUDL.prototype.define = function define(route, middleware, resource){
    var param = '/:id',
        paramName = 'id',
        paramMatch = paramRegx.exec(route);

    if (route[0] !== '/') {
        route = '/'+route;
    }

    // extract params
    if (paramMatch) {
        param = paramMatch[0];
        paramName = paramMatch[1];
        route = route.replace(paramRegx, '');
    }

    var middlewareAll = this.expandMiddleware([].concat(middleware).concat(resource.beforeAll));
    var middlewareCreate = this.expandMiddleware([].concat(resource.beforeCreate));
    var middlewareDelete = this.expandMiddleware([].concat(resource.beforeDelete));
    var middlewareRead = this.expandMiddleware([].concat(resource.beforeRead));
    var middlewareReadById = this.expandMiddleware([].concat(resource.beforeReadById));
    var middlewareUpdate = this.expandMiddleware([].concat(resource.beforeUpdate));


    if (resource.create) {
        this.router.post(route, _.compact(middlewareAll.concat(middlewareCreate)), handlerCreate.bind(this.ctx, resource));
    }

    if (resource.delete) {
        this.router.delete(route + param, _.compact(middlewareAll.concat(middlewareDelete)), handlerDelete.bind(this.ctx, resource, paramName));
    }

    if (resource.read) {
        this.router.get(route, _.compact(middlewareAll.concat(middlewareRead)), handlerRead.bind(this.ctx, resource));
    }

    if (resource.readById) {
        this.router.get(route + param, _.compact(middlewareAll.concat(middlewareReadById)), handlerReadById.bind(this.ctx, resource, paramName));
    }

    if (resource.update) {
        this.router.put([route + param], _.compact(middlewareAll.concat(middlewareUpdate)), handlerUpdate.bind(this.ctx, resource, paramName));
    }
};