/*
 * Some util functions for tests. This file is not runnable as a test.
 */
var config = require('../config');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

var Transaction = require('../models/transaction');
var Wallet = require('../models/wallet');
var User = require('../models/user');
var Business = require('../models/business');

getUserToken = function(email){
    return jwt.sign({ email: email, business: false }, config.jwtsecret);
};


getBusinessToken = function(email){
    return jwt.sign({ email: email, business: true }, config.jwtsecret);
};


restoreTransactionsUsers = function(done){
    var wallet = new Wallet( {
        email: 'user@lime.com',
        balance_amount: 10,
        total_money_received: 10,
        total_money_spent: 10
    });

    var wallet2 = new Wallet( {
        email: 'user2@lime.com',
        balance_amount: 20,
        total_money_received: 20,
        total_money_spent: 20
    });

    var user = new User({
        email: 'user@lime.com',
        first_name: 'John',
        last_name: 'Smith',
        password:  crypto.createHash('md5').update("123").digest('hex'),
        date_of_birth: new Date("12/12/1994"),
        gender: "male",
        preferences: ["chinese food", "thai"]
    });


    var user2 = new User({
        email: 'user2@lime.com',
        first_name: 'John',
        last_name: 'Smith',
        password:  crypto.createHash('md5').update("123").digest('hex'),
        date_of_birth: new Date("12/12/1994"),
        gender: "male",
        preferences: ["chinese food", "thai"]
    });

    var admin = new User({
        email: 'admin@lime.com',
        first_name: 'Admin',
        last_name: 'Smith',
        password:  crypto.createHash('md5').update("123").digest('hex'),
        date_of_birth: new Date("12/12/1994"),
        gender: "male",
        preferences: ["chinese food", "thai"]
    });

    var business = new Business(
        {
            email: "bo@lime.com",
            password: crypto.createHash('md5').update("123").digest('hex'),
            person_in_charge_name: "Bruce Owner",
            address: "La Rambla",
            phone_number: "876293123"
        }
    );

    var business2 = new Business(
        {
            email: "bo2@lime.com",
            password: crypto.createHash('md5').update("123").digest('hex'),
            person_in_charge_name: "Bruce Owner",
            address: "La Rambla",
            phone_number: "876293123"
        }
    );


    var tx1 = new Transaction(

    );

    //First, delete, then insert
    return User.remove({})
        .then(function(){
            return Wallet.remove({});
        })
        .then(function(){
            return Business.remove({});
        })
        .then(function(){
            return Transaction.remove();
        })
        .then(function(){
            return admin.save();
        })
        .then(function(){
            return user.save();
        })
        .then(function(){
            return user2.save();
        })
        .then(function(){
            return business.save();
        })
        .then(function(){
            return business2.save();
        })
        .then(function(){
            return wallet.save();
        })
        .then(function(){
            return wallet2.save();
        })
        .then(function(){
            done();
        })
        .catch(function(){
            done(); //Already existing
        });
};



createMultipleTransactions = function(done){

    var new1 = new Transaction({
        business_owner: "bo@lime.com",
        timestamp: 1511525310000,
        total_amount: 10.50,
        status: "new"
    });

    var new2 = new Transaction({
        business_owner: "bo2@lime.com",
        timestamp: 1511698110000,
        total_amount: 10.50,
        status: "new"
    });

    var userAccepted1 = new Transaction({
        user: "user@lime.com",
        business_owner: "bo@lime.com",
        timestamp: 1511525310000,
        total_amount: 10.50,
        virtual_money_used: 5,
        payback_amount: 0.05,
        status: "user_accepted"
    });


    var userAccepted2 = new Transaction({
        user: "user2@lime.com",
        business_owner: "bo2@lime.com",
        timestamp: 1511698110000,
        total_amount: 10.50,
        virtual_money_used: 5,
        payback_amount: 0.05,
        status: "user_accepted"
    });

    var confirmed1 = new Transaction({
        user: "user@lime.com",
        business_owner: "bo@lime.com",
        timestamp: 1511525310000,
        total_amount: 10.50,
        virtual_money_used: 5,
        payback_amount: 0.05,
        status: "confirmed"
    });


    var confirmed2 = new Transaction({
        user: "user2@lime.com",
        business_owner: "bo2@lime.com",
        timestamp: 1511698110000,
        total_amount: 10.50,
        virtual_money_used: 5,
        payback_amount: 0.05,
        status: "confirmed"
    });

    var rejected1 = new Transaction({
        user: "user@lime.com",
        business_owner: "bo@lime.com",
        timestamp: 1511525310000,
        total_amount: 10.50,
        virtual_money_used: 5,
        payback_amount: 0.05,
        status: "rejected"
    });


    var rejected2 = new Transaction({
        user: "user2@lime.com",
        business_owner: "bo2@lime.com",
        timestamp: 1511698110000,
        total_amount: 10.50,
        virtual_money_used: 5,
        payback_amount: 0.05,
        status: "rejected"
    });


    new1.save()
        .then(function(res){
            return new2.save();
        })
        .then(function(res){
            return userAccepted1.save();
        })
        .then(function(res){
            return userAccepted2.save();
        })
        .then(function(res){
            return confirmed1.save();
        })
        .then(function(res){
            return confirmed2.save();
        })
        .then(function(res){
            return rejected1.save();
        })
        .then(function(res){
            return rejected2.save();
        })
        .then(function(res){
            done();
        });


};

module.exports = {
    getUserToken: getUserToken,
    getBusinessToken: getBusinessToken,
    restoreTransactionsUsers: restoreTransactionsUsers,
    createMultipleTransactions: createMultipleTransactions
};