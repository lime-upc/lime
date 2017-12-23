/**
Router module that handles the REAL TIME HEATMAPS

NOTE: This Javascript file is related to the "real-time-heatmap API" which is NOT part of the Web Services project
 */
 
var express = require('express');
var crypto = require('crypto');
var config = require('../../../config');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mgrs = require('mgrs');
var elasticsearch = require('elasticsearch');
var bodybuilder = require('bodybuilder');
var usng = require('usng/usng.js');


module.exports = function (app) {

    var router = express.Router();

    //Create ElasticSearch client
    var client = new elasticsearch.Client({
      host: '192.168.56.20:9200',
      //log: 'trace'
    });

    var Business = app.models.Business; //Get Business Model (for BO authentication)

    /**
     * GET / -  Get all the data (grid cells MGRS coordinates and number of people per cell) to render the general real time heatmap
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/", function (req, res) {

		timestampMax = new Date(); // now timestamp
		timestampMin = new Date();
		timestampMin.setMinutes(timestampMin.getMinutes() - 5); // 5 minutes ago timestamp
		timestampMaxInteger = timestampMax.getTime();
		timestampMinInteger = timestampMin.getTime();

        var body = bodybuilder()
        //.query('range', 'last_update_timestamp', {gte: timestampMinInteger})
		//.query('range', 'last_update_timestamp', {lte: timestampMaxInteger})
        .aggregation('terms', 'MGRS_coord10')
        .build()

        client.search({
          index: 'locations',
          type: 'loc',
          body: body
        }).then(function (resp) {

            var jsonData = {};
            var aggregationsArray = resp.aggregations.agg_terms_MGRS_coord10.buckets;
            var heatmap = [];
            var people=0;
            for (var i = 0; i < aggregationsArray.length; i++) {
                var key = aggregationsArray[i].key;
                var doc_count = aggregationsArray[i].doc_count;
                var latlong = mgrs.toPoint(key);
                people+=doc_count;
                heatmap.push({ lat: latlong[1], lng: latlong[0], count: doc_count});
            }
            for (var i = 0; i < heatmap.length; i++) {
                heatmap[i].count = heatmap[i].count / people;
            }
            console.log(people);

            res.send({
                "error": false,
                "message": heatmap
            });

        }, function (err) {
            console.trace(err.message);
        });

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
		
		timestampMax = new Date(); // now timestamp
		timestampMin = new Date();
		timestampMin.setMinutes(timestampMin.getMinutes() - 5); // 5 minutes ago timestamp
		timestampMaxInteger = timestampMax.getTime();
		timestampMinInteger = timestampMin.getTime();

        var body = bodybuilder()
        .query('range', 'last_update_timestamp', {gte: timestampMinInteger})
		.query('range', 'last_update_timestamp', {lte: timestampMaxInteger})
        .query('match', 'gender', req.params.gender)
        .aggregation('terms', 'MGRS_coord10')
        .build()

        client.search({
          index: 'locations',
          type: 'loc',
          body: body
        }).then(function (resp) {

            var aggregationsArray = resp.aggregations.agg_terms_MGRS_coord10.buckets;

            var heatmap = [];
            for (var i = 0; i < aggregationsArray.length; i++) {
                var key = aggregationsArray[i].key;
                var doc_count = aggregationsArray[i].doc_count;
                var latlong = mgrs.toPoint(key);
                heatmap.push({lat: latlong[1], lng: latlong[0], count: doc_count});
            }

            res.send({
                "error": false,
                "message": heatmap
            });

        }, function (err) {
            console.trace(err.message);
        });

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

		timestampMax = new Date(); // now timestamp
		timestampMin = new Date();
		timestampMin.setMinutes(timestampMin.getMinutes() - 5); // 5 minutes ago timestamp
		timestampMaxInteger = timestampMax.getTime();
		timestampMinInteger = timestampMin.getTime();

        var body = bodybuilder()
        .query('range', 'last_update_timestamp', {gte: timestampMinInteger})
		.query('range', 'last_update_timestamp', {lte: timestampMaxInteger})
        .query('range', 'age', {gte: ageMin})
        .query('range', 'age', {lte: ageMax})
        .aggregation('terms', 'MGRS_coord10')
        .build();

        client.search({
          index: 'locations',
          type: 'loc',
          body: body
        }).then(function (resp) {

            var aggregationsArray = resp.aggregations.agg_terms_MGRS_coord10.buckets;

            var heatmap = [];
            for (var i = 0; i < aggregationsArray.length; i++) {
                var key = aggregationsArray[i].key;
                var doc_count = aggregationsArray[i].doc_count;
                var latlong = mgrs.toPoint(key);
                heatmap.push({lat: latlong[1], lng: latlong[0], count: doc_count});
            }

            res.send({
                "error": false,
                "message": heatmap
            });

        }, function (err) {
            console.trace(err.message);
        });

    });


        /**
     * GET /users-nearby/:businessCoord -  Get aggregated data about users nearby a business specified in terms of "lat-lon" coordinates
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/users-nearby/:businessCoord", function (req, res) {

		var businessCoord = req.params.businessCoord;
		var parsedBusinessCoord = businessCoord.split("-"); //array of [lat,lon]
        var converter = new usng.Converter(); // MGRS converter
        var businessMGRS100 = converter.LLtoMGRS(parsedBusinessCoord[0], parsedBusinessCoord[1], 4);

		timestampMax = new Date(); // now timestamp
		timestampMin = new Date();
		timestampMin.setMinutes(timestampMin.getMinutes() - 5); // 5 minutes ago timestamp
		timestampMaxInteger = timestampMax.getTime();
		timestampMinInteger = timestampMin.getTime();

        var body = bodybuilder()
        .query('match', 'MGRS_coord100', businessMGRS100)
        .query('range', 'last_update_timestamp', {gte: timestampMinInteger})
		.query('range', 'last_update_timestamp', {lte: timestampMaxInteger})
        .build()

        client.search({
          index: 'locations',
          type: 'loc',
          body: body
        }).then(function (resp) {

        var hits = resp.hits.hits;

            var maleCounter = 0;
            var femaleCounter = 0;
            var resultsMap = {};

            for (var i = 0; i < resp.hits.hits.length; i++) {
                if (hits[i]._source.gender=="male")
                    maleCounter++;
                else femaleCounter++;

                var age = hits[i]._source.age;
                if ("age"+age in resultsMap)
                    resultsMap["age"+age]++;
                else 
                    resultsMap["age"+age] = 1;
            }

            resultsMap["maleCounter"] = maleCounter;
            resultsMap["femaleCounter"] = femaleCounter;

            res.send({
                "error": false,
                "message": resultsMap
            });

        }, function (err) {
            console.trace(err.message);
        });

    });



    return router;
};