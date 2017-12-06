/**
 * Script that cleans the DB completely, and inserts fake users, fake business owners, loads restaurants
 * from the Google Places API, and inserts the admin user.
 */
var mongoose = require('mongoose'),
config = require("../config"),
models = require("./models"),
crypto = require('crypto');
process = require('process');
var rp = require('request-promise');

var createFakeUsers = require('../fake-users-creator/main');
var downloadPlacesData = require('../data-loader/dataDownloader');
var loadPlacesData = require('../data-loader/SpatialDBloader');

var User = models.User;
var Business = models.Business;
var Restaurant = models.Restaurant;
var Wallet = models.Wallet;
var Transaction = models.Transaction;

//Database URL
var dbUrl = (process.env.MONGODB_URI || config.db);



function main(){
    console.log("[INFO] Starting deploy");

    mongoose.connect(dbUrl);
    mongoose.connection.once('open', function () {

        console.log("[INFO] Connected to MongoDB via Mongoose " + dbUrl);

        var adminUser = new User(
            {
                email: "admin@lime.com",
                password: crypto.createHash('md5').update("123").digest('hex'),
                first_name: "Admin",
                last_name: "Smith",
                date_of_birth: new Date("07/18/1994"),
                gender: "male",
                preferences: ["vegan","indian","coffee"]
            }
        );


        cleanDatabase()
            .then(function(){
                return createFakeUsers(2000);
            })
            .then(function(){
                return downloadPlacesData();
            })
            .then(function(res){
                return loadPlacesData(res);
            })
            .then(function(res){
                console.log("* Places loaded");
                return  insertFakeBusinesses();
            })
            .then(function(res){
                console.log("\n* Fake business owners created");
                return adminUser.save();

            })
            .then(function(res){
                console.log("* Admin user created");
                console.log("[DONE!]");
                process.exit();
            })
            .catch(function(error){
                console.log(error);
                process.exit();
            });

    });

}

function cleanDatabase(){
    return User.remove({})
        .then(function () {
            console.log('* User collection cleaned');
            return Business.remove()
        })
        .then(function () {
            console.log('* Business collection cleaned');
            return Restaurant.remove()
        })
        .then(function () {
            console.log('* Restaurants collection cleaned');
            return Transaction.remove()
        })
        .then(function () {
            console.log('* Transaction collection cleaned');
            return Wallet.remove()
        })
        .then(function () {

            console.log('* Wallet collection cleaned');
            return true;
        });
}

function insertFakeBusinesses(){


    var promises = [];
    return Restaurant.find()
        .then(function(restaurants){
            console.log("* Creating " + restaurants.length + " fake business owners");
            for(var i = 0; i < restaurants.length ; i++){
                (function(j){ //For each restaurant, we create a business owner using the API

                    var restaurant = restaurants[j];
                    var email = "bo-" + j + "@lime.com";
                    var password = "123";
                    var person_in_charge_name = "Business Owner " + j;
                    var phone_number = getRandomInt(900000000,999999999);
                    var restaurant_id = restaurant._id;

                    var object = {
                        email: email,
                        password: password,
                        person_in_charge_name: person_in_charge_name,
                        phone_number: phone_number,
                        restaurant_id: restaurant_id
                    };


                    var post_options = {

                        uri: 'http://localhost:' + config.port + "/businesses",
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(object)
                    };

                    promises.push(
                        rp(post_options)
                            .then(function(success){
                                process.stdout.write(".");
                            })
                            .catch(function(error){
                                process.stdout.write("x");
                                console.log(error);
                            })
                    );


                })(i);
            }
            return Promise.all(promises);

        })
        .catch(function(error){
            console.log(error);
        });

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

main();