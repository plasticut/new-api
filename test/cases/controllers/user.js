var assert = require('assert');

var database = require('../../helpers/database');
var controllers = require('../../helpers/controllers');

describe('controllers', function() {

    before(database.create);

    describe('user', function() {
        var user = controllers.user;

        describe('create', function() {
            it('should return', function(done) {
                controllers.attach(database);

                user.create({}, { name: 'test-name', surname: 'test-surname' }, function(err, res) {
                    if (err) { return done(err); }

                    assert.deepEqual(res, [{'name':'test-name','surname':'test-surname','age':null,'male':false,'continent':null,'photo':null,'data':null,'id':1}]);

                    done();
                });
            });
        });

        after(database.drop);
    });
});