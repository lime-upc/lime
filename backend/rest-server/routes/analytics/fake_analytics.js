var express = require('express');
var fs = require('fs');


/**
 * This module simulates the analytics API,returning fake data stored in the fake_data folder.
 * This is done so no need to launch Elastic Search etcetera to test the data.
 */
module.exports = function (app) {

    var router = express.Router();




    router.get("/rankings/:criteria", function (req, res) {


        if(req.params.criteria!=="tags" && req.params.criteria!=="restaurants"){
            res.status(400).send({
                "error": true,
                "message": "Only 'tags' and 'restaurants' are allowed"
            });
            return;
        }

        var criteria = req.params.criteria==='tags' ? 'tag_ranking' : 'restaurant_ranking';

        var content = fs.readFileSync('./backend/rest-server/routes/analytics/fake_data/' + criteria + ".json","utf-8");

        res.send(content);


    });

    //Aggregated for all the businesses
    router.get("/transactions/:criteria", function (req, res) {


        if(req.params.criteria!=="gender" && req.params.criteria!=="age" && req.params.criteria!=="hour"){
            res.status(400).send({
                "error": true,
                "message": "Only 'gender', 'age' and 'hour' are allowed"
            });
            return;
        }

        var criteria = "";
        if (req.params.criteria === 'gender'){
            criteria = "gender_all";
        }
        else if (req.params.criteria === 'age'){
            criteria = "age_all";
        }
        else{
            //Is hour
            criteria = "hour_all";
        }

        var content = fs.readFileSync('./backend/rest-server/routes/analytics/fake_data/' + criteria + ".json","utf-8");

        res.send(content);

    });

    //Aggregated for only one businesses owner
    router.get("/transactions/:criteria/:businessmail", function (req, res) {


        if(req.params.criteria!=="gender" && req.params.criteria!=="age" && req.params.criteria!=="hour"){
            res.status(400).send({
                "error": true,
                "message": "Only 'gender', 'age' and 'hour' are allowed"
            });
            return;
        }


        var criteria = "";
        if (req.params.criteria === 'gender'){
            criteria = "gender_bo";
        }
        else if (req.params.criteria === 'age'){
            criteria = "age_bo";
        }
        else{
            //Is hour
            criteria = "hour_bo";
        }

        var content = fs.readFileSync('./backend/rest-server/routes/analytics/fake_data/' + criteria + ".json","utf-8");

        res.send(content);

    });




    return router;
};