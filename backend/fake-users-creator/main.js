/*
 *This script creates random, fake users, with format test-N@lime.com and password 123.
 *The gender is random (50% possibilities each), the birth date, the preferences are also random
 *In average, contains 30% of the preferences.
 * Displays '.' for each successfully created user, 'x' for each error.
 *
 * Author: Ismael Rodriguez, 17/11/17
 */
var process = require('process');
var config = require('../config');
var rp = require('request-promise');
var preferences = ["american_restaurant",
    "asian_restaurant",
    "bakery",
    "bar",
    "bar_grill",
    "barbecue_restaurant",
    "breakfast_restaurant",
    "buffet_restaurant",
    "cafe",
    "chinese_restaurant",
    "coffee_shop",
    "deli",
    "diner",
    "family_restaurant",
    "fast_food_restaurant",
    "french_restaurant",
    "hamburger_restaurant",
    "ice_cream_shop",
    "indian_restaurant",
    "italian_restaurant",
    "japanese_restaurant",
    "korean_restaurant",
    "liban_restaurant",
    "meal_takeaway",
    "mexican_restaurant",
    "pizza_delivery",
    "pizza_restaurant",
    "pub",
    "ramen_restaurant",
    "restaurant",
    "sandwich_shop",
    "seafood_restaurant",
    "sports_bar",
    "steak_house",
    "sushi_restaurant",
    "tea_house",
    "thai_restaurant"];

function createFakeUsers(USERS){
    console.log("* Creating "  + USERS + " fake end-users");
    var promises = [];
    for(var i = 0; i < USERS; i++){
        (function(){

            //Random birth date
            var dayOfBirth = getRandomInt(1,28);
            var monthOfBirth = getRandomInt(1,12);
            var yearOfBirth = getRandomInt(1950,2000);

            //Random gender
            var gender = 'female';
            if(getRandomInt(0,100)>50){
                gender = 'male';
            }

            //Random preferences (statistically, 30% of total)
            var myPrefs = [];
            preferences.forEach(function(pref){
                if(getRandomInt(0,100)<30){
                    myPrefs.push(pref);
                }
            });


            var userObject = {
                "email": "test-" + i + "@lime.com",
                "first_name": "John" + i,
                "last_name": "Smith",
                "password": "123",
                "date_of_birth": "" + monthOfBirth + "/" + dayOfBirth + "/" + yearOfBirth,
                "gender": gender,
                "preferences": myPrefs
            };

            var post_options = {

                uri: 'http://localhost:' + config.port + "/users",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userObject)
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



        })();
    }

    return Promise.all(promises)
        .then(function(){
           console.log("\n* Users created successfully")
        });

}



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = createFakeUsers;