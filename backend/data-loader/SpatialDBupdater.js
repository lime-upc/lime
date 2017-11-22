// Declare variables
var fs = require('fs'),
    obj

// Read the file
var content = fs.readFileSync("outputFile.json");
var jsonContent = JSON.parse(content);

// Function used to remove slashes from strings
function replacer(string) {
    return string.replace(/\\/g,'');
}

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// MongoDB connection URL
var url = 'mongodb://localhost:27017/lime';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to MongoDB server");

    for (let i = 0; i < jsonContent.results.length; i++) {

        db.collection("spatialDB").findOne({"_id": jsonContent.results[i].place_id}, function(err, result) {
            if (err) throw err;

            //check if the element is already in the DB
            if (result != null) {

                //check if it differs from the already stored one (in terms of price level, rating or permanently closed tag: in such a case, update DB
                if (result.price_level!=jsonContent.results[i].price_level ||
                    result.rating!=jsonContent.results[i].rating ||
                    (typeof jsonContent.results[i].permanently_closed !== "undefined" && result.permanently_closed!=jsonContent.results[i].permanently_closed)) {

                    var perm_closed;
                    if (typeof jsonContent.results[i].permanently_closed !== "undefined" && jsonContent.results[i].permanently_closed == true)
                        perm_closed=true;
                    else perm_closed=false;

                    var newvalues = { $set: { price_level: jsonContent.results[i].price_level, rating: jsonContent.results[i].rating, permanently_closed: perm_closed} };
                    db.collection("spatialDB").updateOne({"_id": jsonContent.results[i].place_id}, newvalues, function(err, res) {
                        if (err) throw err;
                    });
                    console.log("Updated " + result.name);
                }

                else
                    console.log("No need to update " + result.name);

            }

            //if the element is not in the DB yet, insert it into the DB
            else {

                var perm_closed;
                if (typeof jsonContent.results[i].permanently_closed !== "undefined" && jsonContent.results[i].permanently_closed == true)
                    perm_closed=true;
                else perm_closed=false;

                var myobj = {
                    _id: jsonContent.results[i].place_id,
                    name: replacer(JSON.stringify(jsonContent.results[i].name)),
                    location: {
                        type: "Point",
                        coordinates: [jsonContent.results[i].geometry.location.lng, jsonContent.results[i].geometry.location.lat]
                    },
                    price_level: jsonContent.results[i].price_level,
                    rating: jsonContent.results[i].rating,
                    address: replacer(JSON.stringify(jsonContent.results[i].vicinity)),
                    additional_information: "",
                    notification_texts: [],
                    notification_in_use_index: 0,
                    tags: "",
                    affiliated: false,
                    permanently_closed: perm_closed
                };

                console.log("Inserting " + myobj.name + " into the collection!");
                db.collection("spatialDB").insertOne(myobj, function(err, res) {
                    if (err) throw err;
                });


            }


        });

    }

    //console.log("DB update completed!");
    //db.close();
});





