var config = require('../../../helpers/config');
var dbhelper = require(config.helpersPath+'/database');
var FixtLoader = require(config.pathCovered+'lib/fixt-loader');
var chai = require('chai');
var async = require('async');
var fs = require('fs');
var expect = chai.expect;
var assert = chai.assert;
var fixturesPath = config.fixturesPath;

describe('Fixtures Loader' , function(){
    var self = this;
    before(function(done){

        var objects1 = [{
                model: 'accessToken',
                data:{
                    id: 1,
                    value: 'foo',
                    refreshToken: 'bar',
                    expiration_date: new Date(),
                    userId: 1,
                    apiclientId: 1
                }
            },
            {
                model: 'accessToken',
                data:{
                    id: 2,
                    value: 'foo',
                    refreshToken: 'bar',
                    expiration_date: new Date(),
                    userId: 1,
                    apiclientId: 1
                }
            }]
        var objects2 = [{
            model: 'accessToken',
            data:{
                id: 3,
                value: 'foo',
                refreshToken: 'bar',
                expiration_date: new Date(),
                userId: 1,
                apiclientId: 1
            }
        },
            {
                model: 'accessToken',
                data:{
                    id: 4,
                    value: 'foo',
                    refreshToken: 'bar',
                    expiration_date: new Date(),
                    userId: 1,
                    apiclientId: 1
                }
            }]
        var objects3 = [{
            model: 'accessToken',
            data:{
                id: 5,
                value: 'foo',
                refreshToken: 'bar',
                expiration_date: new Date(),
                userId: 1,
                apiclientId: 1
            }
        },
            {
                model: 'accessToken',
                data:{
                    id: 6,
                    value: 'foo',
                    refreshToken: 'bar',
                    expiration_date: new Date(),
                    userId: 1,
                    apiclientId: 1
                }
            }]


        fs.openSync(fixturesPath+'/test.json', 'w');
        fs.writeFileSync(fixturesPath+'/test.json', JSON.stringify(objects1));

        objects1[1].data.id =1;
        fs.openSync(fixturesPath+'/test-error.json', 'w');
        fs.writeFileSync(fixturesPath+'/test-error.json', JSON.stringify(objects1));
        objects1[1].data.id =2;

        fs.mkdirSync(fixturesPath+'/testfolder');
        fs.openSync(fixturesPath+'/testfolder/1.json', 'w');
        fs.openSync(fixturesPath+'/testfolder/2.json', 'w');
        fs.openSync(fixturesPath+'/testfolder/3.txt', 'w');
        fs.writeFileSync(fixturesPath+'/testfolder/1.json', JSON.stringify(objects1));
        fs.writeFileSync(fixturesPath+'/testfolder/2.json', JSON.stringify(objects2));
        fs.writeFileSync(fixturesPath+'/testfolder/3.txt', JSON.stringify(objects3));

        fs.mkdirSync(fixturesPath+'/testfolder-error');
        objects1[1].data.id =1;
        fs.openSync(fixturesPath+'/testfolder-error/1.json', 'w');
        fs.openSync(fixturesPath+'/testfolder-error/2.json', 'w');
        fs.writeFileSync(fixturesPath+'/testfolder-error/1.json', JSON.stringify(objects1));
        fs.writeFileSync(fixturesPath+'/testfolder-error/2.json', JSON.stringify(objects2));
        objects1[1].data.id =2;

        dbhelper.setup(function(err, database){
            self.models = database.models;
            self.fixtLoader = new FixtLoader(database);
            done();
        });
    });

    after(function(done){
        fs.unlinkSync(fixturesPath + '/testfolder/1.json');
        fs.unlinkSync(fixturesPath + '/testfolder/2.json');
        fs.unlinkSync(fixturesPath + '/testfolder/3.txt');
        fs.unlinkSync(fixturesPath + '/testfolder-error/1.json');
        fs.unlinkSync(fixturesPath + '/testfolder-error/2.json');
        fs.unlinkSync(fixturesPath + '/test.json');
        fs.unlinkSync(fixturesPath + '/test-error.json');
        fs.rmdirSync(fixturesPath + '/testfolder');
        fs.rmdirSync(fixturesPath + '/testfolder-error');
        dbhelper.drop(function(){
            done();
        });
    });
    beforeEach(function(done){
        dbhelper.truncate(['accessToken'], done);
    });

    describe('fromObject', function(){

        it("should add record to databse from given object", function(done){
            var AccessToken = self.models.accessToken;
            var object = {
                model: 'accessToken',
                data:{
                    id: 1,
                    value: 'foo',
                    refreshToken: 'bar',
                    expiration_date: new Date(),
                    userId: 1,
                    apiclientId: 1
                }
            }
            async.waterfall([
                function(callback){
                    self.fixtLoader.fromObject(object, callback);
                },
                function(data, callback){
                    AccessToken.find({id: object.data.id}, callback);
                }
            ],function(err, tokens){
                if(err){
                    done(err);
                    return;
                }
                expect(tokens.length).to.be.equal(1);
                expect(tokens[0]).to.be.deep.equal(object.data);
                done();
            });
        });


        it("should call callback with error if passed undefined model", function(done){
            var object = {
                model: 'blabla',
                data:{
                    id: 1,
                    value: 'foo',
                    refreshToken: 'bar',
                    expiration_date: new Date(),
                    userId: 1,
                    apiclientId: 1
                }
            }
            self.fixtLoader.fromObject(object, function(err, data){
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.have.string(object.model);
                done();
            });
        });


        it("should call callback with error on primary key duplicating", function(done){

            var object = {
                model: 'accessToken',
                data:{
                    id: 1,
                    value: 'foo',
                    refreshToken: 'bar',
                    expiration_date: new Date(),
                    userId: 1,
                    apiclientId: 1
                }
            }
            async.series([
                function(callback){
                    self.fixtLoader.fromObject(object, callback);
                },
                function(callback){
                    self.fixtLoader.fromObject(object, function(err, data){
                        expect(err).to.be.instanceof(Error);
                        expect(err.message).to.have.string('PRIMARY');
                        callback();
                    })
                }

            ], function(err){
                done(err);
            })
        });

    });

    describe('fromFile',function(){
        it("should call callback with error if file does not exist", function(done){
            var path = fixturesPath + '/test123.json';
            self.fixtLoader.fromFile(path, function(err){
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.have.string(path);
                done()
            })
        });

        it("should call callback with error if path is not a file", function(done){
            var path = fixturesPath;
            self.fixtLoader.fromFile(path, function(err){
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.have.string('is not a file');
                done();
            })
        });

        it("should call callback with error if path is not a json file", function(done){
            var path = config.helpersPath+'/config.js';
            self.fixtLoader.fromFile(path, function(err){
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.have.string('json');
                done();
            })
        });

        it("should call callback with error on primary key duplicating", function(done){

            var path = fixturesPath+'/test-error.json';
            var objects  = require(path);
            var AccessToken = self.models.accessToken;
            async.waterfall([
                function(callback){
                    self.fixtLoader.fromFile(path, callback);
                },
                function(data, callback){
                    AccessToken.find({id: [101, 102]}, callback)
                }
            ],function(err, tokens){
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.have.string('PRIMARY');
                done();
            });
        });

        it("should add records to databse from given JSON file", function(done){
            var path = fixturesPath+'/test.json';
            var objects  = require(path);
            var AccessToken = self.models.accessToken;
            async.waterfall([
                function(callback){
                    self.fixtLoader.fromFile(path, callback);
                },
                function(data, callback){
                    AccessToken.find({id: [objects[0].data.id, objects[1].data.id]}, callback)
                }
            ],function(err, tokens){
                if(err){
                    done(err);
                    return;
                }
                expect(tokens.length).to.be.equal(2);
                assert.notStrictEqual(tokens[0], objects[0].data);
                assert.notStrictEqual(tokens[1], objects[1].data);
                done();
            });
        });
    });
    describe("From folder", function(){
        it("should call callback with error if folder does not exists", function(done){
            var path = fixturesPath+'/123';
            self.fixtLoader.fromFolder(path, function(err){
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.have.string(path);
                done()
            })
        });

        it("should call callback with error if passed path is not folder", function(done){
            var path = fixturesPath + '/test.json';
            self.fixtLoader.fromFolder(path, function(err){
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.have.string('is not a folder');
                done()
            })
        });

        it("should add records to database from only json files given folder contains", function(done){
            var path = fixturesPath + '/testfolder';
            var AccessToken = self.models.accessToken;
            async.waterfall([
                function(callback){
                    self.fixtLoader.fromFolder(path, callback);
                },
                function(data, callback){
                    AccessToken.find({id: [1, 2, 3, 4, 5, 6]}, callback)
                }
            ],function(err, tokens){
                if(err){
                    done(err);
                    return;
                }
                expect(tokens.length).to.be.equal(4);
                expect(tokens[0].id).to.be.equal(1);
                expect(tokens[1].id).to.be.equal(2);
                expect(tokens[2].id).to.be.equal(3);
                expect(tokens[3].id).to.be.equal(4);
                done();
            });
        });

        it("should call callback with error on primary key duplicating", function(done){

            var path = fixturesPath+'/testfolder-error';
            var AccessToken = self.models.accessToken;
            async.waterfall([
                function(callback){
                    self.fixtLoader.fromFolder(path, callback);
                },
                function(data, callback){
                    AccessToken.find({id: [1, 2, 3, 4, 5, 6]}, callback)
                }
            ],function(err, tokens){
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.have.string('PRIMARY');
                done();
            });
        });
    })
});