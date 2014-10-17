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
                fxl.fromFile(self.fixtPath+'/user_client.json', callback);
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
                    .send({username: 'vasya', password:'eloper', grant_type: 'password'})
                    .expect(401, {}, done);
            });
            it("should respond with code 401 if client name incorrect", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('givemetoken', 'demo'))
                    .send({username: 'vasya', password:'eloper', grant_type: 'password'})
                    .expect(401, {}, done);
            });

            it("should respond with code 401 if client password incorrect", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'givemetoken'))
                    .send({username: 'vasya', password:'eloper', grant_type: 'password'})
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

            it("should respond with code 400 if no username passed", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({password:'eloper', grant_type: 'password'})
                    .expect(400,
                    {
                        error: 'invalid_request',
                        error_description: 'Missing required parameter: username'
                    },
                    done);
            });

            it("should respond with code 400 if no password passed", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({username:'dev', grant_type: 'password'})
                    .expect(400,
                    {
                        error: 'invalid_request',
                        error_description: 'Missing required parameter: password'
                    },
                    done);
            });

            it("should respond with code 501 if no grant_type passed", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({username: 'vasya', password:'eloper'})
                    .expect(501,
                    {
                        error: 'unsupported_grant_type',
                        error_description: 'Unsupported grant type: undefined'
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
            before(function(done){
                dbhelper.truncate(['accessToken', 'refreshToken'], function(err){
                    if(err){
                        return done(err);
                    }
                    self.fxl.fromFile(self.fixtPath+'/tokens.json', done);
                });
            });

            it("should respond with code 400 if no refresh token sended", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({grant_type: 'refresh_token'})
                    .expect(400, {
                        error: 'invalid_request',
                        error_description: 'Missing required parameter: refresh_token'
                    }, done);
            });


            it("should respond with code 403 if refresh token incorrect", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({grant_type: 'refresh_token', refresh_token: '123'})
                    .expect(403, {
                            error: 'invalid_grant',
                            error_description: 'Invalid refresh token'
                    }, done);
            });

            it("should respond with code 403 if refresh token were received for other client", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({grant_type: 'refresh_token', refresh_token: 'wrongclient'})
                    .expect(403, {
                        error: 'invalid_grant',
                        error_description: 'Invalid refresh token'
                    }, done);
            });

            it("should respond with new tokens pair if refresh token was correct", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({grant_type: 'refresh_token', refresh_token: 'refresh'})
                    .expect(200)
                    .end(function(err, res){
                        expect(res.body).to.include.keys('refresh_token', 'access_token','expires_in');
                        done();
                    })
            });

            it("should remove used refresh token", function(done){
                request(app).post(self.url)
                    .type('form')
                    .set('Authorization', authHeader('new-ui', 'demo'))
                    .send({grant_type: 'refresh_token', refresh_token: 'refresh1'})
                    .expect(200)
                    .end(function(err, res){
                        expect(res.body).to.include.keys('refresh_token', 'access_token','expires_in');
                        reuseToken();
                    });

                var reuseToken = function(){
                    request(app).post(self.url)
                        .type('form')
                        .set('Authorization', authHeader('new-ui', 'demo'))
                        .send({grant_type: 'refresh_token', refresh_token: 'refresh1'})
                        .expect(403, {
                            error: 'invalid_grant',
                            error_description: 'Invalid refresh token'
                        },done);
                }


            });

        });
    });
});