/**
    @module config
*/

var config = {
    'production': process.env.NODE_ENV === 'production',

    'port':  process.env.PORT || 3000,
    'securePort':  process.env.PORT || 3333,

    'session': {
        'secret': '80d49ce7-64b8-4238-aa06-69b5182d5fd4',
        'store': {
            'type': 'none',
            // 'type': 'redis',
            'config': {
                'host': process.env.REDIS_HOST || 'localhost',
                'port': process.env.REDIS_PORT || 6379
            }
        }
    }
};

var env = process.env.NODE_ENV;
if(!env){
    env = 'dev';
}
var dbconfig = require('../database.json');

config.database = {
    'protocol' : dbconfig[env].driver,
    'database' : dbconfig[env].database,
    'host'     : dbconfig[env].host,
    'port'     : dbconfig[env].port,
    'user'     : dbconfig[env].user,
    'password' : dbconfig[env].password,
    'query'    : {
        'pool'     : true,
        'debug'    : false,
        'strdates' : false
    },
    'sync': true,

    'defaults': {
        'apiClient': {
            'name': 'new-ui',
            'displayName': 'New UI',
            'password': 'demo'
        },
        'user': {
            'name': 'Test user',
            'userName': 'dev',
            'password': 'eloper'
        },
        'accessToken': {
            'token': 'test-token'
        }
    }
}


module.exports = config;
