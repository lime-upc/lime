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
var mgrs = require('mgrs');


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

module.exports = function(path,locationMap,speedMS,updateFreqS,endCallback){

    var self = this;
    var path = path;
    var speedMS = speedMS;
    var locationMap = locationMap;
    var updateFreqS = updateFreqS;
    var currentDistance = 0;
    var endCallback = endCallback;
    var currentPoint = path.getPointFromDistanceInM(0);


    var myStops = [];


    //PUBLIC: (Re)starts the path from random point.
    this.init = function(){
        currentDistance = Math.floor(Math.random() * path.totalDistanceInM) + 0
        currentPoint = path.getPointFromDistanceInM(currentDistance);
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


        //First, put on our cell
        var currentCell = cordToMGRS(currentPoint.lat,currentPoint.long);
        if(locationMap[currentCell]==undefined){
            locationMap[currentCell] = 0;
        }
        locationMap[currentCell]++;
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

            var oldLat = currentPoint.lat;
            var oldLong = currentPoint.long;

            if(canMove()){ //Check if we can move (i.e, a stop event is not active)
                move(updateFreqS);
            }

            if(currentDistance <=path.totalDistanceInM){ //If path is not finished, then post to map

                var oldMilitaryCoordinate = cordToMGRS(oldLat,oldLong);
                var newMilitaryCoordinate = cordToMGRS(currentPoint.lat,currentPoint.long);



                if(oldMilitaryCoordinate!=newMilitaryCoordinate){
                    if(locationMap[oldMilitaryCoordinate] == undefined){
                        locationMap[oldMilitaryCoordinate] = 1;
                    }

                    if(locationMap[newMilitaryCoordinate] == undefined){
                        locationMap[newMilitaryCoordinate] = 0;
                    }

                    locationMap[oldMilitaryCoordinate]--;
                    locationMap[newMilitaryCoordinate]++;
                }
                

                
                //process.stdout.write(".");
                startMoving();
            }

            else{ //If not, I finished the path.
                locationMap[cordToMGRS(oldLat,oldLong)]--;
                endCallback(currentDistance);
            }


        },updateFreqS*1000 * randomInRange(0.7,1.3,2)); //Every updateFreq * (0.9-1.1) (-30,+30% error)
    };





    function cordToMGRS(lat,long){

        var full =  mgrs.forward([long,lat]);
        var firstHalf = full.substring(0,8);
        var secondHalf = full.substring(10,13);
        return firstHalf + secondHalf;
    }


    function randomInRange(min, max, precision) {
        return Math.round(Math.random() * Math.pow(10, precision)) /
            Math.pow(10, precision) * (max - min) + min;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }



};