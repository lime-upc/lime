/**
 Router module that handles the REAL TIME HEATMAPS

 NOTE: This Javascript file is related to the "real-time-heatmap API" which is NOT part of the Web Services project
 */

var express = require('express');
var fs = require('fs');
var mgrs = require('mgrs');
var simulator = require('./location-simulator/main.js');

var people = [];
module.exports = function (app) {

    var router = express.Router();


    var locationMap = {};
    simulator.init(locationMap);

    /**
     * GET / -  Get all the data (grid cells MGRS coordinates and number of people per cell) to render the genearl real time heatmap
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/", function (req, res) {


        var heatmap = [];
        for (var cell in locationMap) {
            // skip loop if the property is from prototype
            if(!locationMap.hasOwnProperty(cell)) continue;

            var latlong = mgrs.toPoint(cell);
            heatmap.push({ lat: latlong[0], lng: latlong[1], count: locationMap[cell]});

            // your code
        }

        //var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/general_map.json',"utf-8");

        res.send({error:false,message:heatmap});

    });


    /**
     * GET /gender/:gender -  Get all the data (grid cells MGRS coordinates and number of people per cell) to render the genearl real time heatmap filtered by gender
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/gender/:gender",passport.authenticate('jwt', { session: false }));
    router.get("/gender/:gender", function (req, res) {

        //ERROR: required gender does not exist
        var heatmap = [];
        for (var cell in locationMap) {
            // skip loop if the property is from prototype
            if(!locationMap.hasOwnProperty(cell)) continue;

            var latlong = mgrs.toPoint(cell);
            if(locationMap[cell]>=2) 
            heatmap.push({ lat: latlong[0], lng: latlong[1], count: locationMap[cell]});

            // your code
        }

        //var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/general_map.json',"utf-8");

        res.send({error:false,message:heatmap});

    });


    /**
     * GET /agerange/:agerange -  Get all the data (grid cells MGRS coordinates and number of people per cell) to render the genearl real time heatmap filtered by age range (to be specified as "minAge-maxAge", extreme values included)
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/agerange/:agerange",passport.authenticate('jwt', { session: false }));
    router.get("/agerange/:agerange", function (req, res) {

         //ERROR: required gender does not exist
        var heatmap = [];
        for (var cell in locationMap) {
            // skip loop if the property is from prototype
            if(!locationMap.hasOwnProperty(cell)) continue;

            var latlong = mgrs.toPoint(cell);
            if(locationMap[cell]>=3) 
            heatmap.push({ lat: latlong[0], lng: latlong[1], count: locationMap[cell]});

            // your code
        }

        //var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/general_map.json',"utf-8");

        res.send({error:false,message:heatmap});
    });



        /**
     * GET /users-nearby/counter/:businessCoord -  Get aggregated data about users nearby a business specified in terms of "lat-lon" coordinates
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/users-nearby/:businessCoord", function (req, res) {

        var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/nearby_counter.json',"utf-8");

        res.send(content);

    });



        /**
     * GET /users-nearby/counter/:businessCoord -  Get number of users nearby a business specified in terms of "lat-lon" coordinates
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/users-nearby/counter/:businessCoord", function (req, res) {


        var number = getRandomInt(0,100);

        if(number>60){
            var gender = getRandomInt(0,100);
            if (gender<50) gender = "male";
            else gender = "female";

            var age = getRandomInt(18,60);
            people.push({gender:gender,age:age});
        }
        else if (number < 20){ //Remove
            people.pop();

        }


        var message = {counter:people.length}

        res.send({error:false,message:message});


    });



        /**
     * GET /users-nearby/gender/:businessCoord -  Get number of male and female users nearby a business specified in terms of "lat-lon" coordinates
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/users-nearby/gender/:businessCoord", function (req, res) {

        var number = getRandomInt(0,100);

        if(number>60){
            var gender = getRandomInt(0,100);
            if (gender<50) gender = "male";
            else gender = "female";

            var age = getRandomInt(18,60);
            people.push({gender:gender,age:age});
        }
        else if (number < 20){ //Remove
            people.pop();

        }

        var message = {maleCounter:0,femaleCounter:0};

        for(var i = 0; i < people.length; i++){
            if(people[i].gender=="male") message.maleCounter++;
            else message.femaleCounter++;
        }

        res.send({error:false,message:message});

    });

 


        /**
     * GET /users-nearby/age/:businessCoord -  Get number of users nearby a business specified in terms of "lat-lon" coordinates clustered by age
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/users-nearby/age/:businessCoord", function (req, res) {

        var number = getRandomInt(0,100);

        if(number>60){
            var gender = getRandomInt(0,100);
            if (gender<50) gender = "male";
            else gender = "female";

            var age = getRandomInt(18,60);
            var probability = getRandomInt(0,100);
            //Coffee time, so people from 40 to 60 is more common
            if(probability>2){
                if(probability<40){
                    age = getRandomInt(29,39);
                }
                else if(probability<80){
                    age = getRandomInt(40,55);
                }
                else{
                    age = getRandomInt(56,65);
                }
            }
            else{
                age = getRandomInt(16,28);
            }
            people.push({gender:gender,age:age});
        }
        else if (number < 20){ //Remove
            people.pop();

        }

        var message = {};

        for(var i = 0; i < people.length; i++){
            var age = "" + people[i].age;
            if(!message[age]){
                message[age] = 0;
            }
            message[age]++;
        }

         res.send({error:false,message:message});

    });




    return router;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
