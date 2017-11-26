/**
 * Real-time location simulator. Lime.
 *
 * This script simulates the behaviour of PERSON_NUMBER simulated users, that send location data every
 * UPDATE_FREQUENCY seconds, and that are moving according to the paths stored in the /paths subfolder with
 * WALKING_SPEED speed in meters/second.
 * The users not only move, but stop to have breakfast, lunch, coffee, dinner and sleep.
 * Some randomization is included in the speed and the stop hours.
 *
 * Author: Ismael Rodriguez. 17/11/2017.
 */
var PathObject = require('./PathObject');
var Person = require('./Person');
var http = require('http');
var fs = require('fs');
var config = require('../config');


var PERSON_NUMBER = 50;
var WALKING_SPEED = 1.4; //Meters per second
var UPDATE_FREQUENCY = 10; //In seconds, how often location is sent

//1st. Load files from 'paths' folder
var paths = [];
fs.readdirSync('./location-simulator/paths').forEach(function(file){
    paths.push(new PathObject('./location-simulator/paths/' + file));

});


//2nd- Login and init persons
for(var i = 0; i < PERSON_NUMBER; i++){

    (function(j){
        login("test-" + j + "@lime.com","123", function(response){
            var token = JSON.parse(response).message;
            var randomPath = paths[getRandomInt(0,paths.length -1)]; //Get random path
            var person = new Person(randomPath,token,WALKING_SPEED,UPDATE_FREQUENCY, function(){
                //When path ends, start again
                this.init();
            });
            person.init();
        });
    })(i);


}



//This function executes log-in to retrieve the JWT token.
//It calls callback() with one parameter: the JWT token to send on each request.
function login(email,password,callback){

    var loginObject= {
        email: email,
        password: password
    };

    var post_options = {
        host: 'localhost',
        port: config.port,
        path: '/users/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            callback(chunk);
        });
    });

    // post the data
    post_req.write(JSON.stringify(loginObject));
    post_req.end();


}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

