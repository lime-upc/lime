/**
 * Returns batch analytics for previous day from ElasticSearch.
 * Not a part of the Web Services project.
 */
var express = require('express');
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

function compare(a,b) {
  if (parseInt(a.name) < parseInt(b.name))
    return -1;
  if (parseInt(a.name) > parseInt(b.name))
    return 1;
  return 0;
}
var client = new elasticsearch.Client({
        host: '192.168.56.20:9200'
    });
module.exports = function (app) {

    var router = express.Router();

    //Create ElasticSearch client
    
    //Returns returning users for a certain business owner
    router.get("/users/returning/:boMail",function(req,res){

        client.get({
                index: 'returning_users',
                type: 'result',
                id: req.params.boMail
            }).then(function (resp) {

                var data = resp._source.json; 
                var parsed = JSON.parse(data);

                parsed.frequencies.sort(compare); //Sort frequencies

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

    router.get("/rankings/:criteria", function (req, res) {


        if(req.params.criteria!=="tags" && req.params.criteria!=="restaurants"){
            res.status(400).send({
                "error": true,
                "message": "Only 'tags' and 'restaurants' are allowed"
            });
            return;
        }

        var id = (req.params.criteria==='tags' ? 'tags' : 'restaurants');

        client.get({
            index: 'rankings',
            type: 'result',
            id: id
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

    router.get("/transactions/:startTime/:durationInDays/:criteria/:boMail*?",function(req,res){

        if(!req.params.startTime || !req.params.durationInDays || !req.params.criteria){
            res.status(400).send({
                "error": true,
                "message": "startTime,duration and criteria are needed"
            });
            return;
        }


        var startTime = textToDate(req.params.startTime);
        var durationInDays = req.params.durationInDays; //Duration, in days
        var endTime = addDays(startTime,durationInDays);
        var startTimestamp = startTime.getTime();
        var endTimestamp = endTime.getTime();
        var criteria = req.params.criteria;
        var mail = req.params.boMail;


        if(startTimestamp > endTimestamp){
            res.status(400).send({
                "error": true,
                "message": "startTime must be before than endTime"
            });
            return;
        }

        if(criteria!="month" && criteria!="year" && criteria!="day" && criteria!="week"&& criteria!="hour" && criteria!="age" && criteria!="gender"){
            res.status(400).send({
                "error": true,
                "message": "Accepted criteria: year, month, day, week, hour, age, gender"
            });
            return;
        }

        //Determine which index to use
        var index = "";
        if(!mail){ //Indexes of global analytics
            if(criteria=="age") {index = "txs_age"}
            else if(criteria=="gender") {index = "txs_gender"}
            else  {index = "txs_hour"};
        }
        else{
            if(criteria=="age") {index = "txs_bo_age_hour"}
            else if(criteria=="gender") {index = "txs_bo_gender_hour"}
            else {index = "txs_bo_hour"};
        }


        console.log("*Analytics from " + startTime + " to " + endTime);
        console.log(index);
        totalQuery(index,startTimestamp,endTimestamp,criteria,mail, function(response,err){

            if(!err){
                res.send({
                "error": false,
                "message": response
            });
            }
            else {
                res.status(500).send({
                "error": true,
                "message": err
            });
            }
             
        });
        

    });


    return router;
};

function addDays(date,days) {        
      var one_day=1000*60*60*24; 
      return new Date(date.getTime()+(days*one_day)); 
    }

function totalQuery(index,startDate,endDate,groupAttribute,businessOwner,callback){
    
    var body = bodybuilder();


        if(businessOwner){
            body = body.query('query_string',{"query" : "\""+businessOwner+"\"", "fields" :["bo"]});
        }
        
    
        body = body.aggregation('terms', groupAttribute,
        { 
            order: { _term: 'asc' }, size: 999
        }, 
        agg => agg.aggregation('sum', 'count'))
        .query('range', 'timestamp', {gte: startDate})
        .query('range', 'timestamp', {lte: endDate})
        .build()

        client.search({
          index: index,
          type: 'result',
          body: body
        }).then(function (resp) {

        var results = resp.aggregations["agg_terms_" + groupAttribute].buckets;
        var response = [];
        for(var i = 0; i < results.length; i++){


            response.push({name:results[i].key,count: results[i].agg_sum_count.value})
        }

        callback(response,null);

        }, function (err) {
            callback(null,err);
        });

}


function textToDate(text){
    //YYYY
    var match = text.match(/^(\d*)$/);
    if(match!=null){
        return new Date(match[1])
    }
    //YYYY-MM
    match = text.match(/^(\d*)-(\d*)$/);
     if(match!=null){
        return new Date(match[1],match[2]-1)
    }
    //YYYY-MM-DD
    match = text.match(/^(\d*)-(\d*)-(\d*)$/);
     if(match!=null){
        return new Date(match[1],match[2]-1,match[3])
    }
    //YY-MM-DD HHh
    match = text.match(/^(\d*)-(\d*)-(\d*) (\d*)h$/);
     if(match!=null){
        return new Date(match[1],match[2]-1,match[3],match[4])
    }
    
    //YY-MM-DD week WW
    match = text.match(/^(\d*) week (\d*)$/);
     if(match!=null){
         var d = (1 + (match[2] - 1) * 7); // 1st of January + 7 days for each week
        return new Date(match[1], 0, d);
    }

}