new-api
=======

__Startup__:
```shell
./gen-cert.sh local.ldsconnect.org
npm install -g grunt-cli
npm install
npm start
```

__Components__:
* express https://github.com/strongloop/express
* ORM http://dresende.github.io/node-orm2/
* CRUD with express-crud https://github.com/jsdevel/node-express-crud

__Docs:__
* [Models](/lib/models/README.md)
* [Controllers](/lib/controllers/README.md)
* [Middleware](/lib/middleware/README.md)
* [Samples](/samples/README.md)


Authorization:

* header: 'authorization': 'bearer {token}'
* body: access_token={token}
* query: access_token={token}
