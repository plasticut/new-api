module.exports = {
    'production': process.env.NODE_ENV === 'production',

    'listen':  process.env.PORT || 3000,

    'database': {
        'protocol' : 'mysql',
        'database' : 'new-api',
        'host'     : 'localhost',
        'port'     : 3306,
        'user'     : 'root',
        'password' : '1234567',
        'query'    : {
            'pool'     : true,
            'debug'    : false,
            'strdates' : false
        },
        'sync': true
    },

    'redis': {
        'host': process.env.REDIS_HOST || 'localhost',
        'port': process.env.REDIS_PORT || 6379
    },

    'session': {
        'secret': '80d49ce7-64b8-4238-aa06-69b5182d5fd4'
    }
};