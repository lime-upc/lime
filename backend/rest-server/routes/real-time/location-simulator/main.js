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


var PERSON_NUMBER = 2000;
var WALKING_SPEED = 2; //Meters per second
var UPDATE_FREQUENCY = 1; //In seconds, how often location is sent



function init(locationMap){
    //1st. Load files from 'paths' folder
    var paths = [];
    fs.readdirSync('./backend/rest-server/routes/real-time/location-simulator/paths').forEach(function(file){
        paths.push(new PathObject('./backend/location-simulator/paths/' + file));

    });

    //2nd- Login and init persons
    for(var i = 0; i < PERSON_NUMBER; i++){

        var randomPath = paths[getRandomInt(0,paths.length -1)]; //Get random path
        var person = new Person(randomPath,locationMap,WALKING_SPEED,UPDATE_FREQUENCY, function(){
            //When path ends, start again
            person.init();
        });
        person.init();

    }


    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = {init: init};