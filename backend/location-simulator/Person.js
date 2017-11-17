/**
 * Walking person simulator class.
 * This class simulates a person that walks a path, and can do several stops.
 * The stops have certain degree of randomization, but following a defined pattern.
 * The time when data is sent has some degree of randomization, but following a defined pattern.
 * Also, it sends to a REST endpoint the location using JWT authentication.
 *
 * Exports: constructor, init()
 * Author: Ismael Rodriguez, 17/11/17
 */
var http = require('http');
var process = require('process');
var config = require('../config');


var stopTimes = [ //They have to be written in order of time. Do not overlap. Also, executed one time per each path iteration.
    {
        name: 'breakfast',  //Just for code clarity
        start: 6,           //Minimum hour where breakfast can start (from 0 to 59 minutes)
        end: 11,            //Maximum hour where breakfast can start (from 0 to 59 minutes)
        duration: 30,       //Average duration of breakfast (will be +-40%)
        probability: 80     //Probability that person does breakfast
    },
    {
        name: 'lunch',
        start: 12,
        end: 15,
        duration: 60,
        probability: 80
    },
    {
        name: 'afternoon-coffee',
        start: 17,
        end: 19,
        duration: 1,
        probability: 40
    },
    {
        name: 'dinner',
        start: 20,
        end: 22,
        duration: 60,
        probability: 90
    },
    {
        name: 'sleep',
        start: 23,
        end: 4,
        duration: 400,
        probability: 95
    }
];

module.exports = function(path,token,speedMS,updateFreqS,endCallback){

    var self = this;
    var path = path;
    var speedMS = speedMS;
    var token = token;
    var updateFreqS = updateFreqS;
    var currentDistance = 0;
    var endCallback = endCallback;
    var currentPoint = path.getPointFromDistanceInM(0);


    var myStops = [];


    //PUBLIC: (Re)starts the path from 0.
    this.init = function(){
        currentDistance = 0;
        currentPoint = path.getPointFromDistanceInM(0);
        for(var i = 0; i < stopTimes.length; i++){
            var stop = stopTimes[i];
            var prob = randomInRange(0,100,2);
            if(prob>stop.probability){
                continue; //We do not add this stop
            }
            var currentHour  = new Date().getHours();
            if(currentHour < stop.end ){ //Only activate activable profiles
                var my = {
                    name: stop.name,
                    active: false,
                    start: getRandomInt(stop.start,stop.end),
                    duration: stop.duration * randomInRange(0.6,1.4,2),
                    initTime: undefined
                    //initTime: se pone al empezar, es un timestamp
                };
                myStops.push(
                    my
                );
            }

        }


        startMoving();


    };


    //PRIVATE: This function moves the user X seconds walking in the path
    function move(seconds){

        //1.- Calculate moved distance
        var movedDistance = speedMS*seconds;

        currentDistance += movedDistance;

        currentPoint = path.getPointFromDistanceInM(currentDistance);
    };


    //PRIVATE: Returns true if the user can move, or false if he/she is stopped because some event
    function canMove(){

        for(var index = 0; index < myStops.length; index++){
            var stop = myStops[index];
            if(stop.active){
                //Time run out, stop this stop
                if((Date.now() - stop.initTime)/(1000*60) >= stop.duration){
                    stop.active = false;
                    myStops.splice(index, 1);
                }
                //Still active
                else{
                    return false; //Can't move
                }
            }
            else{ //Not active
                if((new Date().getHours())>=stop.start){ //Need to active a stop
                    stop.active = true;
                    stop.initTime = new Date();
                    return false; //Can-t move
                }
                //Else, no need to activate
            }


        }


        return true; //In any other case
    };





    //PRIVATE: Recursive function that moves the user in the path, if possible, every updateFreq * (0.9-1.1) (-30,+30% margin)
    function startMoving(){



        setTimeout(function(){

            if(canMove()){ //Check if we can move (i.e, a stop event is not active)
                move(updateFreqS);
            }

            if(currentDistance <=path.totalDistanceInM){ //If path is not finished, then post to rest endpoint
                doPost({
                    lat: currentPoint.lat,
                    long: currentPoint.long,
                    distance: currentDistance
                });
                process.stdout.write(".");
                startMoving();
            }

            else{ //If not, I finished the path.
                endCallback(currentDistance);
            }


        },updateFreqS*1000 * randomInRange(0.7,1.3,2)); //Every updateFreq * (0.9-1.1) (-30,+30% error)
    };




    //PRIVATE: Posts the current location to endpoint
    function doPost(post_data){
        var post_options = {
            host: 'localhost',
            port: config.port,
            path: '/location',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'jwt ' + token
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                //Do nothing
            });
        });

        // post the data
        post_req.write(JSON.stringify(post_data));
        post_req.end();

    };


    function randomInRange(min, max, precision) {
        return Math.round(Math.random() * Math.pow(10, precision)) /
            Math.pow(10, precision) * (max - min) + min;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }



};