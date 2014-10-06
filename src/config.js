module.exports = {
    'production': process.env.NODE_ENV === 'production',

    'port':  process.env.PORT || 3000,
    'securePort':  process.env.PORT || 3333,

    'database': {
        'protocol' : 'mysql',
        'database' : 'new_api',
        'host'     : 'localhost',
        'port'     : 3306,
        'user'     : 'dev',
        'password' : 'eloper',
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
    },

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