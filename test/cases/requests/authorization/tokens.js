var config = require('../../../helpers/config');
var dbhelper = require(config.helpersPath+'/database');
var FixtLoader = require(config.pathCovered+'lib/fixt-loader');
var app = require(config.pathCovered+'server.js');
var chai = require('chai');
var async = require('async');
var request = require('supertest');
var expect = chai.expect;
var assert = chai.assert;
var path = require('path');

describe('Token requests', function(){
    var self = this;
    self.fixtPath = path.resolve(__dirname+'/fixtures')
    before(function(done){
        async.waterfall([
            dbhelper.setup,
            function(database, callback){
                dbhelper.truncate(['user', 'apiClient'], function(err){
                    callback(err, database);
                });
            },
            function(database, callback){
                self.models = database.models;
                callback(null, new FixtLoader(database))
            },
            function(fxl, callback){
                self.fxl = fxl;
                fxl.fromFolder(self.fixtPath, callback);
            }
        ], function(err, inserted){
            if(err){
                return done(err);
            }
            done()
        })
    });

    describe('POST oauth/token route', function(){
        self.url = '/oauth/token';
        var authHeader = function(name, password){
            return 'Basic ' + new Buffer(name + ':' + password).toString('base64');
        }
        describe('recieving tokens by username/password', function(){
            it("should respond with code 401 if no authentication data were sended", function(done){
                request(app).post(self.url)
                    .type('form')
                    .expect(401, {}, done);
            });
            it("should respond with code 401 if client name incorrect", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('givemetoken', 'demo'))
                    .expect(401, {}, done);
            });

            it("should respond with code 401 if client password incorrect", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'givemetoken'))
                    .expect(401, {}, done);
            });

            it("should respond with code 403 if username incorrect", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({username: 'vasya1', password:'eloper', grant_type: 'password'})
                    .expect(403,
                        {
                            error: 'invalid_grant',
                            error_description: 'Invalid resource owner credentials'
                        },
                    done);
            });
            it("should respond with code 403 if password incorrect", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({username: 'vasya', password:'eloper1', grant_type: 'password'})
                    .expect(403,
                        {
                            error: 'invalid_grant',
                            error_description: 'Invalid resource owner credentials'
                        },
                    done);
            });

            it("should respond with code 501 if grant_type incorrect", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({username: 'vasya', password:'eloper', grant_type: 'password1'})
                    .expect(501,
                        {
                            error: 'unsupported_grant_type',
                            error_description: 'Unsupported grant type: password1'
                        },
                    done);
            });
            it("should respond with tokens if username/password and clientid/clientsecret are correct", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({username: 'vasya', password:'eloper', grant_type: 'password'})
                    .expect(200)
                    .end(function(err, res){
                        expect(res.body).to.include.keys('refresh_token', 'access_token');
                        done();
                    });
            });
        });
        describe("recieving access token by refresh token", function(){
            it("should respond with code 403 if refresh token incorrect");
            it("should respond with code 403 if access token incorrect");
            it("should remove refresh token if access token incorrect");
        });
    });
});