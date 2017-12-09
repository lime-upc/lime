var express = require('express');
var crypto = require('crypto');
var config = require('../../../config');
var passport = require('passport');
var jwt = require('jsonwebtoken');

var elasticsearch = require('elasticsearch');
var bodybuilder = require('bodybuilder');


function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}

function getYesterday(){
    var date = new Date();

    date.setDate(date.getDate() - 1);

    var year = date.getFullYear();
    var day = pad(date.getDate());
    var month = pad(date.getMonth() + 1);

    return day + "/" + month + "/" + year;

}


module.exports = function (app) {

    var router = express.Router();

    //Create ElasticSearch client
    var client = new elasticsearch.Client({
        host: '192.168.56.20:9200',
        log: 'trace'
    });


    router.get("/rankings/:criteria", function (req, res) {


        if(req.params.criteria!=="tags" && req.params.criteria!=="restaurants"){
            res.status(400).send({
                "error": true,
                "message": "Only 'tags' and 'restaurants' are allowed"
            });
            return;
        }

        var criteria = req.params.criteria==='tags' ? 'tag_ranking' : 'restaurant_ranking';

        client.get({
            index: criteria,
            type: 'result',
            id: getYesterday()
        }).then(function (resp) {

            var data = resp._source.json;
            var parsed = JSON.parse(data);

            res.send({
                "error": false,
                "message": parsed
            });

        }, function (err) {
            console.trace(err.message);
            res.status(500).send({
                "error": true,
                "message": "Error obtaining analytics"
            });
        });

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
            criteria = "gender_txs";
        }
        else if (req.params.criteria === 'age'){
            criteria = "age_txs";
        }
        else{
            //Is hour
            criteria = "hour_txs";
        }

        client.get({
            index: criteria,
            type: 'result',
            id: getYesterday()
        }).then(function (resp) {

            var data = resp._source.json;
            var parsed = JSON.parse(data);

            res.send({
                "error": false,
                "message": parsed
            });

        }, function (err) {
            console.trace(err.message);
            res.status(500).send({
                "error": true,
                "message": "Error obtaining analytics"
            });
        });

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
            criteria = "gender_bo_txs";
        }
        else if (req.params.criteria === 'age'){
            criteria = "age_bo_txs";
        }
        else{
            //Is hour
            criteria = "hour_bo_txs";
        }

        client.get({
            index: criteria,
            type: 'result',
            id: getYesterday() + "_" + req.params.businessmail
        }).then(function (resp) {

            var data = resp._source.json;
            var parsed = JSON.parse(data);

            res.send({
                "error": false,
                "message": parsed
            });

        }, function (err) {
            console.trace(err.message);
            res.status(500).send({
                "error": true,
                "message": "Error obtaining analytics"
            });
        });

    });




    return router;
};