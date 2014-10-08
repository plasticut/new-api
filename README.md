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


__Authorization:__

* header: 'authorization': 'bearer {token}'
* body: access_token={token}
* query: access_token={token}

__Prepare database:__

copy database-example.json to database.json, then:

```shell
sudo subl /etc/mysql/my.cnf
```

```ini
[mysqld]
character-set-server=utf8
collation-server=utf8_general_ci
init_connect='SET collation_connection = utf8_general_ci'
init_connect='SET NAMES utf8'
skip-character-set-client-handshake

[client]
default-character-set=utf8

[mysqldump]
default-character-set=utf8
```

```shell
sudo service mysql restart
mysql -u root -p
```

```sql
CREATE DATABASE `new_api`;
CREATE DATABASE `new_api_test`;
CREATE USER 'dev'@'localhost' IDENTIFIED BY 'eloper';
GRANT ALL PRIVILEGES ON `new_api`.* TO 'dev'@'localhost';
GRANT ALL PRIVILEGES ON `new_api_test`.* TO 'dev'@'localhost';
FLUSH PRIVILEGES;
```

TODO: написать тест, cравнивающий сгенерированную через node-orm.sync базу с базой, созданной db-migrate.