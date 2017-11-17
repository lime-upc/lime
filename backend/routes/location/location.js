/**
 * Router module that receives real-time location data from
 * users and sends it to Kafka.
 */
var express = require('express');
var config = require('../../config');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var avro = require('avsc'),
    kafka = require('kafka-node'),
    HighLevelProducer = kafka.HighLevelProducer,
    Client = kafka.Client;

var avroSchema = require('./avroSchema');

module.exports = function (app) {

    var router = express.Router();

    var producer;
    var isReady = false;
    var type = avro.parse(avroSchema);


    //At the beginning, load Kafka connector
    if(config.kafka_enabled){

        //Connect to Kafka
        var client = new Client(config.kafka_host,'my-client-id',{
            sessionTimeout: 300,
            spinDelay: 100,
            retries: 2
        });

        client.on('error',function(error){
            console.error(error);
        });

        producer = new HighLevelProducer(client);


        producer.on('error', function(error) {
            console.error(error);
        });

        producer.on('ready',function(){
            console.log("[INFO] Connected to KAFKA on " + config.kafka_host);
            isReady = true;
        });


    }



    /**
     * POST / - Post real-time location
     *
     */
    router.post("/",passport.authenticate('jwt',{session: false}));
    router.post("/", function(req,res){

        //ERROR: Kafka is not enabled
        if(!config.kafka_enabled){
            res.status(500).send({
                "error": true,
                "message": "KAFKA is not enabled"
            });
            return;
        }

        //ERROR: Kafka connector is not ready yet
        if(!isReady || !producer ){
            res.status(500).send({
                "error": true,
                "message": "KAFKA connector is not ready"
            });
            return;
        }


        //ERROR: Lat and Long are not supplied
        if (!req.body.lat || !req.body.long){
            res.status(400).send({
                "error": true,
                "message": "All the parameters are required"
            });
            return;
        }



        var originalMessage =  {
            email: req.user.email,
            timestamp: Date.now(),
            lat: Number(req.body.lat),
            long: Number(req.body.long)
        };

        //Encode message in Avro
        var avroMessage = type.toBuffer(originalMessage);

        console.log(originalMessage);
        //Create payload to send, to lime-location topic
        var payload = [
            {
                topic: 'lime-location',
                messages: avroMessage,
                attributes: 1 /* Use GZip compression for payload */ //TODO: why?
            }
        ];


        //SEND: Send payload to Kafka and log result/error
        producer.send(payload, function(error,result){
            console.info('Sent payload to Kafka: ',payload);
            if (error){
                res.status(500).send({
                    "error": false,
                    "message": "Error sending data to Kafka: " + error
                });
                console.error(error);
            }
            else{
                var formattedResult = result[0];
                console.log('result: ',result);
                res.send({
                    "error": false,
                    "message": "OK"
                });
            }
        });

    });


    return router;
};