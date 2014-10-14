var dbhelper = require('../../helpers/database');
var config = require('../../helpers/config');
var chai = require('chai');
var async = require('async');
var expect = chai.expect;
describe('AccessTokenModel', function() {
    before(function(done){
        var self = this;
        dbhelper.setup(function(database){
            self.database = database;
            self.AccessToken = database.models.accessToken;
            done();
        });
    });

    it("should generate expirationd date", function(){
        var expiresIn = config.token.expiresIn;
        var correct = new Date();
        correct.setSeconds(correct.getSeconds()+expiresIn);
        var date = this.AccessToken.generateExpirationDate();
        expect(date).to.be.an.instanceof(Date);
        expect(date.toString()).to.be.equal(correct.toString());
    });

    it("should create accessToken with given id", function(done){
        this.AccessToken.create({
            id: 419,
            value: '123',
            userId: 1,
            apiclientId: 1,
            refreshToken: '123'
        }, function(err, token) {
            if (err) { return done(err); }
            expect(token.id).to.be.equal(419);
            done();
        });
    });

    after(function(done){
        dbhelper.drop(done);
    });
});