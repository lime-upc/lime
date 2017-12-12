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


module.exports = function (app) {

    var router = express.Router();

    //Create ElasticSearch client
    var client = new elasticsearch.Client({
      host: '192.168.56.20:9200',
      //log: 'trace'
    });

    var Business = app.models.Business; //Get Business Model (for BO authentication)

    /**
     * POST /login - Authenticates the business owner
     *
     * Authentication: NO
     * Permissions: anybody
     */
    router.post("/login",function(req,res){
        
                //ERROR: No user or no password
                if (!req.body.email || !req.body.password){
                    res.status(400).send({
                        "error": true,
                        "message": "Please, specify both email and password"
                    });
        
                    return;
                }
        
                //Retrieve email from database
                Business.findOne({email:req.body.email})
                    .then(function(result){
        
                        //ERROR: No result, so the username does not exist
                        if(!result){
                            res.status(401).send({"error": true, "message": "Incorrect email or password"});
                            return;
                        }
        
                        var hash = crypto.createHash('md5').update(req.body.password).digest('hex');
        
                        //ERROR: Password is incorrect
                        if (hash !== result.password){
                            res.status(401).send({"error": true, "message": "Incorrect email or password"});
                            return;
                        }
        
                        //No error. Generate JWT with email
                        var token = jwt.sign({ email: req.body.email, business: true }, config.jwtsecret);
        
                        res.send({
                            "error": false,
                            "message": token
                        });
                    })
                    .catch(function(error){
                        res.status(500).send({"error": true, "message": "Error removing business " + error});
                    });
    });

    /**
     * GET / -  Get all the data (grid cells MGRS coordinates and number of people per cell) to render the genearl real time heatmap
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    //router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/", function (req, res) {

        var body = bodybuilder()
        .aggregation('terms', 'MGRS_coord')
        .build()

        client.search({
          index: 'locations',
          type: 'loc',
          body: body
        }).then(function (resp) {

            var jsonData = {};
            var aggregationsArray = resp.aggregations.agg_terms_MGRS_coord.buckets;

            var heatmap = [];
            for (var i = 0; i < aggregationsArray.length; i++) {
                var key = aggregationsArray[i].key;
                var doc_count = aggregationsArray[i].doc_count;
                var latlong = mgrs.toPoint(key);
                heatmap.push({zone: key, lat: latlong[0], lng: latlong[1], count: doc_count});
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

        var body = bodybuilder()
        .query('match', 'gender', req.params.gender)
        .aggregation('terms', 'MGRS_coord')
        .build()

        client.search({
          index: 'locations',
          type: 'loc',
          body: body
        }).then(function (resp) {

            var aggregationsArray = resp.aggregations.agg_terms_MGRS_coord.buckets;

            var heatmap = [];
            for (var i = 0; i < aggregationsArray.length; i++) {
                var key = aggregationsArray[i].key;
                var doc_count = aggregationsArray[i].doc_count;
                var latlong = mgrs.toPoint(key);
                heatmap.push({lat: latlong[0], lng: latlong[1], count: doc_count});
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

        var body = bodybuilder()
        .query('range', 'age', {gte: ageMin})
        .query('range', 'age', {lte: ageMax})
        .aggregation('terms', 'MGRS_coord')
        .build();

        client.search({
          index: 'locations',
          type: 'loc',
          body: body
        }).then(function (resp) {

            var aggregationsArray = resp.aggregations.agg_terms_MGRS_coord.buckets;


            var heatmap = [];
            for (var i = 0; i < aggregationsArray.length; i++) {
                var key = aggregationsArray[i].key;
                var doc_count = aggregationsArray[i].doc_count;
                var latlong = mgrs.toPoint(key);
                heatmap.push({lat: latlong[0], lng: latlong[1], count: doc_count});
            }


            res.send({
                "error": false,
                "message": heatmap
            });


        }, function (err) {
            console.trace(err.message);
        });

    });

    return router;
};