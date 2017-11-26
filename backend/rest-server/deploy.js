/**
 * Script that cleans the DB and inserts a 'user' and 'admin' users.
 */
var mongoose = require('mongoose'),
config = require("./config"),
models = require("./rest-server/models"),
crypto = require('crypto');
process = require('process');

var User = models.User;

//Database URL
var dbUrl = (process.env.MONGODB_URI || config.db);


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

    var regularUser = new User(
        {
            email: "user@lime.com",
            password: crypto.createHash('md5').update("123").digest('hex'),
            first_name: "User",
            last_name: "Smith",
            date_of_birth: new Date("07/18/1994"),
            gender: "male",
            preferences: ["vegan","indian","coffee"]
        }
    );



    User.remove({})
        .then(function (response) {
            console.log('* User collection cleaned');
            return adminUser.save()
        })
        .then(function (response) {
            console.log('* Admin user created');
            return regularUser.save()
        })
        .then(function (response) {
            console.log('* Regular user added!');
            console.log('[DONE] Deploy finished');
            process.exit();
        })
        .catch(function(error){
            console.log(error);
            process.exit();
        });

});
