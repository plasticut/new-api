var config = require('../../../helpers/config');
var dbhelper = require(config.helpersPath+'/database');
var FixtLoader = require(config.pathCovered+'lib/fixt-loader');
var app = require(config.pathCovered+'server.js');
var chai = require('chai');
var async = require('async');
var request = require('supertest');
var expect = chai.expect;
var assert = chai.assert;
var fixturesPath = config.fixturesPath;

describe('Token requests', function(){
    var self = this;
//    it()
    describe('POST oauth2/token route', function(){
        describe('recieving tokens by username/password', function(){
            it("should respond with code 403 if no authentication data were sended");
            it("should respond with code 403 if username/password incorrect");
            it("should respond with code 403 if clientId/clientSecret incorrect");
            it("should respond with tokens if username/password and clientid/clientsecret are correct");
        });
        describe("recieving access token by refresh token", function(){
            it("should respond with code 403 if refresh token incorrect");
            it("should respond with code 403 if access token incorrect");
            it("should remove refresh token if access token incorrect");
        });
    });
});