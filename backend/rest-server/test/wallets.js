/**
 * TESTS for the /wallets RESTE API.
 * @type {string}
 */
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

var Utils = require('./utils');

//Load models
var Transaction = require('../models/transaction');
var Wallet = require('../models/wallet');
var User = require('../models/user');
var Business = require('../models/business');

chai.use(chaiHttp);

var userJWT = Utils.getUserToken("user@lime.com");
var user2JWT = Utils.getUserToken("user2@lime.com");

var adminJWT = Utils.getUserToken("admin@lime.com");

describe('GET /wallets',function(){


    beforeEach(function(done){
        Utils.restoreTransactionsUsers(done);
    });

    it("Admin can read the list of wallets",function(done){

        chai.request(server)
            .get('/wallets')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(2);
                done();
            });

    });


    it("Regular users cannot read the list of wallets",function(done){

        chai.request(server)
            .get('/wallets')
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });

    });
});


describe('GET /wallets/:id',function(){


    beforeEach(function(done){
        Utils.restoreTransactionsUsers(done);
    });

    it("Admin can read a wallet",function(done){

        chai.request(server)
            .get('/wallets/user@lime.com')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.balance_amount.should.be.eql(10);
                res.body.message.total_money_received.should.be.eql(10);
                res.body.message.total_money_spent.should.be.eql(10);

                done();
            });

    });

    it("A user can read their wallet",function(done){

        chai.request(server)
            .get('/wallets/user2@lime.com')
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.balance_amount.should.be.eql(20);
                res.body.message.total_money_received.should.be.eql(20);
                res.body.message.total_money_spent.should.be.eql(20);

                done();
            });

    });

    it("A user cannot read other user's wallet",function(done){

        chai.request(server)
            .get('/wallets/user@lime.com')
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("You are not authorized to perform this action");

                done();
            });

    });


    it("A user receives authorization error when querying not existing wallet",function(done){

        chai.request(server)
            .get('/wallets/fake@lime.com')
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("You are not authorized to perform this action");

                done();
            });

    });

    it("Admin receives 404 when querying non existing wallet",function(done){

        chai.request(server)
            .get('/wallets/fake@lime.com')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(404);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("Wallet not found");

                done();
            });

    });



});