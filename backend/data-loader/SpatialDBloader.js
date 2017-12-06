// Declare variables
var fs = require('fs');
var models = require("../rest-server/models");

var Restaurant = models.Restaurant;

// Function used to remove slashes from strings
function replacer(string) {
    return string.replace(/\\/g, '');
}

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// MongoDB connection URL
var url = 'mongodb://localhost:27017/lime';
var database;
function main(content) {


    var jsonContent = JSON.parse(content);


    //First thing, we have to return a promise
    return new Promise(function(fulfill,reject){
        MongoClient.connect(url,function(err,db){
            if (err) reject(err);
            else fulfill(db);
        });
    })
    .then(function(db){
        database = db;
        var insertPromises = [];

        //For each element of the input JSON file
        for (i = 0; i < jsonContent.results.length; i++) {

            var perm_closed;
            if (typeof jsonContent.results[i].permanently_closed !== "undefined" && jsonContent.results[i].permanently_closed)
                perm_closed = true;
            else perm_closed = false;

            var myobj = new Restaurant({
                _id: jsonContent.results[i].place_id,
                name: replacer(JSON.stringify(jsonContent.results[i].name)),
                location: {
                    type: "Point",
                    coordinates: [jsonContent.results[i].geometry.location.lng, jsonContent.results[i].geometry.location.lat]
                },
                price_level: jsonContent.results[i].price_level,
                rating: jsonContent.results[i].rating,
                address: replacer(JSON.stringify(jsonContent.results[i].vicinity)),
                permanently_closed: perm_closed
            });



            (function(obj){
                insertPromises.push(new Promise(function (fulfill, reject) {
                    myobj.save( function (err, res) {
                        console.log("* Inserted " + obj.name + " into the collection!");
                        if (err) {
                            reject(err);
                        }
                        else {
                            fulfill(true);
                        }
                    });
                }));
            })(myobj);



        }


        return Promise.all(insertPromises);

    })
    .then(function(){
        return new Promise(function (fulfill, reject) {
            // Create the Geospatial index
            database.collection("restaurants").createIndex(
                {location: "2dsphere"}, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log("* Created index: " + result);
                        database.close();
                        fulfill(true);
                    }

                });
        })
    });






}

module.exports = main;