/**
 * Tests for the /transactions REST API.
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

var boJWT = Utils.getBusinessToken("bo@lime.com");
var bo2JWT = Utils.getBusinessToken("bo2@lime.com");

var adminJWT = Utils.getUserToken("admin@lime.com");



describe('GET /transaction', function(){

    //Before all the tests, we insert a user and a business owner
    before(function(done){
        Utils.restoreTransactionsUsers(done);
    });

    before(function(done){
        Utils.createMultipleTransactions(done);
    });

  /*  beforeEach(function(done){

       Transaction.remove({},done);
    });*/

    it('Admin should get all the transactions', function(done){
        chai.request(server)
            .get('/transactions')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(8);
                done();
            });
    });

    it('Admin should get transactions of a specific user', function(done){
        chai.request(server)
            .get('/transactions?user=user@lime.com')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(3); //Only 3 transactions of such user
                done();
            });
    });

    it('Admin should get transactions of a specific bo', function(done){
        chai.request(server)
            .get('/transactions?bo=bo@lime.com')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(4); //Half of tx are of this b.o.
                done();
            });
    });


    it('Admin should get transactions of a specific bo and specific user', function(done){
        chai.request(server)
            .get('/transactions?bo=bo@lime.com&user=user@lime.com')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(3); //Only 3 transactions of such user with such BO
                done();
            });
    });


    it('Regular user should get error when getting all the transactions', function(done){
        chai.request(server)
            .get('/transactions')
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });

    it('Regular BO should get error when getting all the transactions', function(done){
        chai.request(server)
            .get('/transactions')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });


    it('User should get transactions when asking his transactions', function(done){
        chai.request(server)
            .get('/transactions?user=user@lime.com')
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                done();
            });
    });

    it('User should get transactions when asking his transactions with a certain BO', function(done){
        chai.request(server)
            .get('/transactions?user=user@lime.com&bo=bo@lime.com')
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(3); //Only 3 transactions of such user
                done();
            });
    });

    it('User should get error when asking transactions of other user', function(done){
        chai.request(server)
            .get('/transactions?user=user2@lime.com')
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });



    it('BO should get transactions when asking his transactions', function(done){
        chai.request(server)
            .get('/transactions?bo=bo@lime.com')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(4); //Only 3 transactions of such user
                done();
            });
    });

    it('BO should get transactions when asking his transactions with a user', function(done){
        chai.request(server)
            .get('/transactions?bo=bo@lime.com&user=user@lime.com')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(3); //Only 3 transactions of such user
                done();
            });
    });

    it('BO should get error when asking transactions of other BO', function(done){
        chai.request(server)
            .get('/transactions?bo=bo2@lime.com')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });


    it('Filter by status works correctly',function(done){
        chai.request(server)
            .get('/transactions?status=new')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(2); //Only 2 transactions are new
                done();
            });

    });

    it('Filter by status works correctly with user',function(done){
        chai.request(server)
            .get('/transactions?status=confirmed&user=user@lime.com')
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(1); //Only 2 transactions are new
                done();
            });

    });


    //Should get 8, as they are from 24 to 26 november 2017
    it('Start date works correctly',function(done){
        chai.request(server)
            .get('/transactions?startDate=24-11-2017')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(8); //Only 2 transactions are new
                done();
            });

    });

    it('Start date works correctly (only half)',function(done){
        chai.request(server)
            .get('/transactions?startDate=25-11-2017')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(4); //Only 2 transactions are new
                done();
            });

    });

    it('End date works correctly',function(done){
        chai.request(server)
            .get('/transactions?endDate=26-11-2017')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(8); //Only 2 transactions are new
                done();
            });

    });

    it('End date works correctly (only half)',function(done){
        chai.request(server)
            .get('/transactions?endDate=24-11-2017')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(4); //Only 2 transactions are new
                done();
            });

    });

    it('Interval works correctly (all)',function(done){
        chai.request(server)
            .get('/transactions?startDate=24-11-2017&endDate=26-11-2017')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(8); //Only 2 transactions are new
                done();
            });

    });

    it('Interval works correctly (only one day)',function(done){
        chai.request(server)
            .get('/transactions?startDate=24-11-2017&endDate=24-11-2017')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('array');
                res.body.message.length.should.be.eql(4); //Only 2 transactions are new
                done();
            });

    });






});

describe('GET /transaction/:transactionID', function() {

    var newId;
    var userAcceptedId;
    var confirmedId;
    var rejectedId;

    before(function(done){
        Utils.restoreTransactionsUsers(done);
    });

    //Insert transactions. Only done once.
    before(function(done){
        var newTx = new Transaction({
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 10.50,
            status: "new"
        });

        var userAccepted = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 10.50,
            virtual_money_used: 5,
            payback_amount: 0.05,
            status: "user_accepted"
        });

        var confirmed = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 10.50,
            virtual_money_used: 5,
            payback_amount: 0.05,
            status: "confirmed"
        });


        var rejected = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 10.50,
            virtual_money_used: 5,
            payback_amount: 0.05,
            status: "rejected"
        });

        newTx.save()
            .then(function(res){
                newId = res._id;
                return userAccepted.save();
            })
            .then(function(res){
                userAcceptedId = res._id;
                return confirmed.save();
            })
            .then(function(res){
                confirmedId = res._id;
                return rejected.save();
            })
            .then(function(res){
                rejectedId = res._id;
                done();
            })

    });

    it('Every user can read transactions that are new',function(done){
        chai.request(server)
            .get('/transactions/' + newId)
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a("object");
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.total_amount.should.be.eql(10.50);
                res.body.message.status.should.be.eql("new");
                done();
            });
    });

    it('When in "user_accepted" status, the user itself can read it',function(done){
        chai.request(server)
            .get('/transactions/' + userAcceptedId)
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a("object");
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.user.should.be.eql("user@lime.com");
                res.body.message.total_amount.should.be.eql(10.50);
                res.body.message.status.should.be.eql("user_accepted");
                done();
            });
    });

    it('When in "user_accepted" status, another user cannot read it',function(done){
        chai.request(server)
            .get('/transactions/' + userAcceptedId)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });


    it('When in "user_accepted" status, the bo can read it',function(done){
        chai.request(server)
            .get('/transactions/' + userAcceptedId)
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a("object");
                done();
            });
    });

    it('When in "user_accepted" status, another bo cannot read it',function(done){
        chai.request(server)
            .get('/transactions/' + userAcceptedId)
            .set('Authorization','jwt ' + bo2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });

    it('When in "confirmed" status, the user itself can read it',function(done){
        chai.request(server)
            .get('/transactions/' + confirmedId)
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a("object");
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.user.should.be.eql("user@lime.com");
                res.body.message.total_amount.should.be.eql(10.50);
                res.body.message.virtual_money_used.should.be.eql(5);
                res.body.message.payback_amount.should.be.eql(0.05);
                res.body.message.status.should.be.eql("confirmed");
                done();
            });
    });

    it('When in "confirmed" status, another user cannot read it',function(done){
        chai.request(server)
            .get('/transactions/' + confirmedId)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });


    it('When in "confirmed" status, the bo can read it',function(done){
        chai.request(server)
            .get('/transactions/' + confirmedId)
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                done();
            });
    });

    it('When in "confirmed" status, another bo cannot read it',function(done){
        chai.request(server)
            .get('/transactions/' + confirmedId)
            .set('Authorization','jwt ' + bo2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });


    it('When in "rejected" status, the user itself can read it',function(done){
        chai.request(server)
            .get('/transactions/' + rejectedId)
            .set('Authorization','jwt ' + userJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a("object");
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.user.should.be.eql("user@lime.com");
                res.body.message.total_amount.should.be.eql(10.50);
                res.body.message.virtual_money_used.should.be.eql(5);
                res.body.message.payback_amount.should.be.eql(0.05);
                res.body.message.status.should.be.eql("rejected");
                done();
            });
    });

    it('When in "rejected" status, another user cannot read it',function(done){
        chai.request(server)
            .get('/transactions/' + rejectedId)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });


    it('When in "rejected" status, the bo can read it',function(done){
        chai.request(server)
            .get('/transactions/' + rejectedId)
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                done();
            });
    });

    it('When in "rejected" status, another bo cannot read it',function(done){
        chai.request(server)
            .get('/transactions/' + rejectedId)
            .set('Authorization','jwt ' + bo2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                done();
            });
    });


    it('When in "user_accepted" status, admin can read it',function(done){
        chai.request(server)
            .get('/transactions/' + userAcceptedId)
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                done();
            });
    });

    it('When in "confirmed" status, admin can read it',function(done){
        chai.request(server)
            .get('/transactions/' + confirmedId)
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                done();
            });
    });

    it('When in "rejected" status, admin can read it',function(done){
        chai.request(server)
            .get('/transactions/' + rejectedId)
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                done();
            });
    });




});

//To create a transaction
describe('POST /transaction', function() {

    before(function(done){
        Utils.restoreTransactionsUsers(done);
    });



    it('A business owner can create a transaction', function(done){

        var txObject = {
            total_amount: 12.56
        };

        chai.request(server)
            .post('/transactions')
            .send(txObject)
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.total_amount.should.be.eql(12.56);
                res.body.message.status.should.be.eql("new");
                done();
            });

    });

    it('Receives error 400 if parameters not correct', function(done){

        var txObject = {
            incorrect_param: "hi"
        };

        chai.request(server)
            .post('/transactions')
            .send(txObject)
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                done();
            });

    });



});


//To create a transaction
describe('POST /transaction/:id/virtual_money', function() {


    var txId;
    var acceptedId;
    before(function(done){
        Utils.restoreTransactionsUsers(done);
    });


    //Insert a transaction in new state.
    beforeEach(function(done){
        var newTx = new Transaction({
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            status: "new"
        });

        var userAcceptedTx =  new Transaction({
            business_owner: "bo@lime.com",
            user: "user@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            status: "user_accepted"
        });

        newTx.save()
            .then(function(res){
                txId = res._id;
                return userAcceptedTx.save();

            })
            .then(function(res){
                acceptedId = res._id;
                done();
            });

    });


    //Make user2 wallet to have 10 units
    before(function(done){
       Wallet.findOneAndUpdate({email: "user2@lime.com"},
           {
               $set:
                   {
                        balance_amount: 10,
                        total_money_received:  100,
                        total_money_spent: 100
                   }
           }
           )
           .then(function(){
               done();
           });

    });


    it('User can pay with 0 virtual money',function(done){


        var txObject = {
            virtual_money_used: 0
        };
        chai.request(server)
            .post('/transactions/' + txId + '/virtual_money')
            .send(txObject)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.total_amount.should.be.eql(12);
                res.body.message.user.should.be.eql("user2@lime.com");
                res.body.message.virtual_money_used.should.be.eql(0);
                res.body.message.payback_amount.should.be.eql(12*0.03); //3%
                res.body.message.status.should.be.eql("user_accepted");
                done();
            });

    });

    it('User can pay with less than half virtual money',function(done){


        var txObject = {
            virtual_money_used: 3
        };
        chai.request(server)
            .post('/transactions/' + txId + '/virtual_money')
            .send(txObject)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.total_amount.should.be.eql(12);
                res.body.message.user.should.be.eql("user2@lime.com");
                res.body.message.virtual_money_used.should.be.equal(3);
                res.body.message.payback_amount.should.be.eql(9*0.03); //3%
                res.body.message.status.should.be.eql("user_accepted");
                done();
            });

    });


    it('Error if wrong parameters',function(done){

        var txObject = {
            wrong: "parameter"
        };
        chai.request(server)
            .post('/transactions/' + txId + '/virtual_money')
            .send(txObject)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                done();
            });

    });


    it('Error if already user_accepted',function(done){

        var txObject = {
            wrong: "parameter"
        };
        chai.request(server)
            .post('/transactions/' + acceptedId + '/virtual_money')
            .send(txObject)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                done();
            });

    });


    it('Error if selected virtual money amount is more than what user has in wallet',function(done){

        var txObject = {
            virtual_money_used: 12
        };
        chai.request(server)
            .post('/transactions/' + txId + '/virtual_money')
            .send(txObject)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("You don't have that amount of virtual money");
                done();
            });

    });

    it('Error if selected virtual money amount is more than 50% of total amount',function(done){

        var txObject = {
            virtual_money_used: 9
        };
        chai.request(server)
            .post('/transactions/' + txId + '/virtual_money')
            .send(txObject)
            .set('Authorization','jwt ' + user2JWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("You cannot pay more than 50% of total with Virtual Money");
                done();
            });

    });


});

//Business owner confirms the transaction
describe('POST /transactions/:id/confirm',function(){

    var newId;
    var userAcceptedId;
    var confirmedId;
    var rejectedId;

    before(function(done){
        Utils.restoreTransactionsUsers(done);
    });

    //Insert one transaction
    beforeEach(function(done){
        var newTx = new Transaction({
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            status: "new"
        });

        var userAccepted = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            virtual_money_used: 3,
            payback_amount: 0.27,
            status: "user_accepted"
        });

        var confirmed = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            virtual_money_used: 3,
            payback_amount: 0.27,
            status: "confirmed"
        });

        var rejected = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            virtual_money_used: 3,
            payback_amount: 0.27,
            status: "rejected"
        });

        newTx.save()
            .then(function(res){
                newId = res._id;
                return userAccepted.save();
            })
            .then(function(res){
                userAcceptedId = res._id;
                return confirmed.save();
            })
            .then(function(res){
                confirmedId = res._id;
                return rejected.save();
            })
            .then(function(res){
                rejectedId = res._id;
                done();
            });

    });

    //Make user2 wallet to have 10 units
    beforeEach(function(done){
        Wallet.findOneAndUpdate({email: "user@lime.com"},
            {
                $set:
                    {
                        balance_amount: 10,
                        total_money_received:  100,
                        total_money_spent: 100
                    }
            }
        )
            .then(function(){
                done();
            });

    });


    it("Can confirm if is the BO and transaction is in user_accepted state, and wallet is modified",function(done){

        chai.request(server)
            .post('/transactions/' + userAcceptedId + '/confirm')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.total_amount.should.be.eql(12);
                res.body.message.user.should.be.eql("user@lime.com");
                res.body.message.virtual_money_used.should.be.equal(3);
                res.body.message.payback_amount.should.be.eql(9*0.03); //3%
                res.body.message.status.should.be.eql("confirmed");

                //Now, check if transaction in database has been modified
                Wallet.findOne({email: "user@lime.com"})
                    .then(function(res){
                        res.should.be.a('object');
                        var newBalance = 10 - 3 + 9*0.03;
                        res.balance_amount.should.be.eql(newBalance); //Used 3 virtual moneys
                        res.total_money_spent.should.be.eql(103); //Used 3 virtual moneys
                        res.total_money_received.should.be.eql(100 + 9*0.03); //Received 9*0.03
                        done();
                    });


            });
    });

    it("Can confirm if is admin and transaction is in user_accepted state, and wallet is modified",function(done){

        chai.request(server)
            .post('/transactions/' + userAcceptedId + '/confirm')
            .set('Authorization','jwt ' + adminJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.total_amount.should.be.eql(12);
                res.body.message.user.should.be.eql("user@lime.com");
                res.body.message.virtual_money_used.should.be.equal(3);
                res.body.message.payback_amount.should.be.eql(9*0.03); //3%
                res.body.message.status.should.be.eql("confirmed");

                //Now, check if transaction in database has been modified
                Wallet.findOne({email: "user@lime.com"})
                    .then(function(res){
                        res.should.be.a('object');
                        var newBalance = 10 - 3 + 9*0.03;
                        res.balance_amount.should.be.eql(newBalance); //Used 3 virtual moneys
                        res.total_money_spent.should.be.eql(103); //Used 3 virtual moneys
                        res.total_money_received.should.be.eql(100 + 9*0.03); //Received 9*0.03
                        done();
                    });


            });
    });


    it("Get error if it is a different BO",function(done){

        chai.request(server)
            .post('/transactions/' + userAcceptedId + '/confirm')
            .set('Authorization','jwt ' + bo2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("You don't have the permission to confirm this transaction");
                done();

            });
    });


    it("Get error if transaction is already confirmed",function(done){

        chai.request(server)
            .post('/transactions/' + confirmedId + '/confirm')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("Transaction is already confirmed");
                done();

            });
    });

    it("Get error if transaction is already rejected",function(done){

        chai.request(server)
            .post('/transactions/' + rejectedId + '/confirm')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("Transaction is rejected. Cannot confirm.");
                done();

            });
    });

    it("Get error if transaction is in 'new' state (the user did not pay yet)",function(done){

        chai.request(server)
            .post('/transactions/' + newId + '/confirm')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("User has yet to introduce virtual money amount");
                done();

            });
    });


});

//Business owner rejects the transaction
describe('POST /transactions/:id/reject',function(){

    var newId;
    var userAcceptedId;
    var confirmedId;
    var rejectedId;

    before(function(done){
        Utils.restoreTransactionsUsers(done);
    });

    //Insert one transaction
    beforeEach(function(done){
        var newTx = new Transaction({
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            status: "new"
        });

        var userAccepted = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            virtual_money_used: 3,
            payback_amount: 0.27,
            status: "user_accepted"
        });

        var confirmed = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            virtual_money_used: 3,
            payback_amount: 0.27,
            status: "confirmed"
        });

        var rejected = new Transaction({
            user: "user@lime.com",
            business_owner: "bo@lime.com",
            timestamp: Date.now(),
            total_amount: 12,
            virtual_money_used: 3,
            payback_amount: 0.27,
            status: "rejected"
        });

        newTx.save()
            .then(function(res){
                newId = res._id;
                return userAccepted.save();
            })
            .then(function(res){
                userAcceptedId = res._id;
                return confirmed.save();
            })
            .then(function(res){
                confirmedId = res._id;
                return rejected.save();
            })
            .then(function(res){
                rejectedId = res._id;
                done();
            });

    });

    //Make user2 wallet to have 10 units
    beforeEach(function(done){
        Wallet.findOneAndUpdate({email: "user@lime.com"},
            {
                $set:
                    {
                        balance_amount: 10,
                        total_money_received:  100,
                        total_money_spent: 100
                    }
            }
        )
            .then(function(){
                done();
            });

    });


    it("Can reject if is the BO and transaction is in new.",function(done){

        chai.request(server)
            .post('/transactions/' + newId + '/reject')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.total_amount.should.be.eql(12);
                res.body.message.status.should.be.eql("rejected");


                done();


            });
    });

    it("Can reject if is the BO and transaction is in user_accepted state. Wallet is not modified.",function(done){

        chai.request(server)
            .post('/transactions/' + userAcceptedId + '/reject')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(200);
                res.body.error.should.be.eql(false);
                res.body.message.should.be.a('object');
                res.body.message.business_owner.should.be.eql("bo@lime.com");
                res.body.message.total_amount.should.be.eql(12);
                res.body.message.user.should.be.eql("user@lime.com");
                res.body.message.virtual_money_used.should.be.equal(3);
                res.body.message.payback_amount.should.be.eql(9*0.03); //3%
                res.body.message.status.should.be.eql("rejected");

                //Now, check if transaction in database has been modified
                Wallet.findOne({email: "user@lime.com"})
                    .then(function(res){
                        res.should.be.a('object');
                        res.balance_amount.should.be.eql(10); //Used 3 virtual moneys
                        res.total_money_spent.should.be.eql(100); //Used 3 virtual moneys
                        res.total_money_received.should.be.eql(100); //Received 9*0.03
                        done();
                    });


            });
    });

    it("Get error if it is a different BO",function(done){

        chai.request(server)
            .post('/transactions/' + userAcceptedId + '/reject')
            .set('Authorization','jwt ' + bo2JWT)
            .end(function(err,res){
                res.should.have.status(403);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("You don't have the permission to reject this transaction");
                done();

            });
    });

    it("Gets error if already confirmed",function(done){

        chai.request(server)
            .post('/transactions/' + confirmedId + '/reject')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("Transaction is already confirmed");
                done();

            });
    });

    it("Gets error if already rejected",function(done){

        chai.request(server)
            .post('/transactions/' + rejectedId + '/reject')
            .set('Authorization','jwt ' + boJWT)
            .end(function(err,res){
                res.should.have.status(400);
                res.body.error.should.be.eql(true);
                res.body.message.should.be.eql("Transaction is already rejected");
                done();

            });
    });




});