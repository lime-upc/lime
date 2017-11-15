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
var url = 'mongodb://localhost:27017/SpatialDB';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to MongoDB server");

//For each element of the input JSON file
    for (i = 0; i < jsonContent.results.length; i++) {

        var perm_closed;
        if (typeof jsonContent.results[i].permanently_closed !== "undefined" && jsonContent.results[i].permanently_closed == true)
            perm_closed=true;
        else perm_closed=false;

        var myobj = {
            _id: jsonContent.results[i].place_id,
            name: replacer(JSON.stringify(jsonContent.results[i].name)),
            lat: jsonContent.results[i].geometry.location.lat,
            long: jsonContent.results[i].geometry.location.lng,
            price_level: jsonContent.results[i].price_level,
            rating: jsonContent.results[i].rating,
            address: replacer(JSON.stringify(jsonContent.results[i].vicinity)),
            additional_information: "",
            notification_text: "",
            tags: "",
            affiliated: false,
            permanently_closed: perm_closed
        };

        console.log("Inserting " + myobj.name + " into the collection!");
        db.collection("businesses").insertOne(myobj, function(err, res) {
            if (err) throw err;
        });

    }

    db.close();

});


