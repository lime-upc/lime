// Declare variables
var fs = require('fs')


// Function used to remove slashes from strings
function replacer(string) {
    return string.replace(/\\/g,'');
}

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// MongoDB connection URL
var url = 'mongodb://localhost:27017/lime';

function main(content){

    var jsonContent = JSON.parse(content);

    var promises = [];


    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);

        for (var i = 0; i < jsonContent.results.length; i++) {

            (function(j){
                promises.push(new Promise(function(fulfill,reject){

                    db.collection("restaurants").findOne({"_id": jsonContent.results[j].place_id}, function(err, result) {
                        if (err) throw err;


                        //check if the element is already in the DB
                        if (result != null) {
                            //check if it differs from the already stored one (in terms of price level, rating or permanently closed tag: in such a case, update DB
                            if (result.price_level!=jsonContent.results[j].price_level ||
                                result.rating!=jsonContent.results[j].rating ||
                                (typeof jsonContent.results[j].permanently_closed !== "undefined" && result.permanently_closed!=jsonContent.results[j].permanently_closed)) {

                                var perm_closed;
                                if (typeof jsonContent.results[j].permanently_closed !== "undefined" && jsonContent.results[j].permanently_closed == true)
                                    perm_closed=true;
                                else perm_closed=false;

                                var newvalues = { $set: { price_level: jsonContent.results[j].price_level, rating: jsonContent.results[j].rating, permanently_closed: perm_closed} };
                                db.collection("restaurant").updateOne({"_id": jsonContent.results[j].place_id}, newvalues, function(err, res) {
                                    if (err) reject(err);
                                    else fulfill(true);
                                });
                                console.log("Updated " + result.name);
                            }

                            else
                                console.log("No need to update " + result.name);

                        }

                        //if the element is not in the DB yet, insert it into the DB
                        else {

                            var perm_closed;
                            if (typeof jsonContent.results[j].permanently_closed !== "undefined" && jsonContent.results[j].permanently_closed == true)
                                perm_closed=true;
                            else perm_closed=false;

                            var myobj = {
                                _id: jsonContent.results[j].place_id,
                                name: replacer(JSON.stringify(jsonContent.results[j].name)),
                                location: {
                                    type: "Point",
                                    coordinates: [jsonContent.results[j].geometry.location.lng, jsonContent.results[j].geometry.location.lat]
                                },
                                price_level: jsonContent.results[j].price_level,
                                rating: jsonContent.results[j].rating,
                                address: replacer(JSON.stringify(jsonContent.results[j].vicinity)),
                                permanently_closed: perm_closed
                            };

                            console.log("Inserting " + myobj.name + " into the collection!");
                            db.collection("restaurants").insertOne(myobj, function(err, res) {
                                if (err) reject(err);
                                else fulfill(true);
                            });


                        }


                    });
                }));
            })(i);




        }

        //console.log("DB update completed!");
        //db.close();
    });

    return Promise.all(promises);

}
module.exports =  main;

