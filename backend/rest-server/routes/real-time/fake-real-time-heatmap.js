/**
 Router module that handles the REAL TIME HEATMAPS

 NOTE: This Javascript file is related to the "real-time-heatmap API" which is NOT part of the Web Services project
 */

var express = require('express');
var fs = require('fs');


module.exports = function (app) {

    var router = express.Router();



    /**
     * GET / -  Get all the data (grid cells MGRS coordinates and number of people per cell) to render the genearl real time heatmap
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/", function (req, res) {


        var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/general_map.json',"utf-8");

        res.send(content);

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
        if (req.params.gender != "male" && req.params.gender != "female") {
            res.status(401).send({"error": true, "message": "Incorrect value for the 'gender' parameter (accepted values: 'male', 'female')"});
            return;
        }

        var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/' + req.params.gender + '_map.json',"utf-8");

        res.send(content);

    });


    /**
     * GET /agerange/:agerange -  Get all the data (grid cells MGRS coordinates and number of people per cell) to render the genearl real time heatmap filtered by age range (to be specified as "minAge-maxAge", extreme values included)
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/agerange/:agerange",passport.authenticate('jwt', { session: false }));
    router.get("/agerange/:agerange", function (req, res) {

        var ageRange = req.params.agerange;
        var parsedAgeRange = ageRange.split("-");
        var ageMin = parsedAgeRange[0];
        var ageMax = parsedAgeRange[1];

        //ERROR: age range not valid
        if (ageMin<5 || ageMin>100 || ageMax<5 || ageMax>100) {
            res.status(401).send({"error": true, "message": "Incorrect values for 'agerange parameter (accepted values: 'minAge-maxAge', with ages between 5 and 100)"});
            return;
        }

        var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/age_map.json',"utf-8");

        res.send(content);

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

        var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/nearby_counter.json',"utf-8");

        res.send(content);


    });



        /**
     * GET /users-nearby/gender/:businessCoord -  Get number of male and female users nearby a business specified in terms of "lat-lon" coordinates
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/users-nearby/gender/:businessCoord", function (req, res) {

        var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/nearby_gender.json',"utf-8");

        res.send(content);

    });

 


        /**
     * GET /users-nearby/age/:businessCoord -  Get number of users nearby a business specified in terms of "lat-lon" coordinates clustered by age
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/users-nearby/age/:businessCoord", function (req, res) {

        var content = fs.readFileSync('./backend/rest-server/routes/real-time/fake_data/nearby_age.json',"utf-8");

        res.send(content);


    });




    return router;
};