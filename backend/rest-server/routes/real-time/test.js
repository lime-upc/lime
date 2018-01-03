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

 //Create ElasticSearch client
    var client = new elasticsearch.Client({
      host: '192.168.56.20:9200',
      //log: 'trace'
    });


var monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth() - 1);
var START_DATE = monthAgo.getTime();
var END_DATE = Date.now();

//TXs last month, grouped by week
console.log(Date.now())

console.log(monthAgo.getTime())
totalQuery("txs_hour",START_DATE,END_DATE,"age");

function totalQuery(index,startDate,endDate,groupAttribute,businessOwner){
	
	var body = bodybuilder();


		if(businessOwner){
			body = body.query('query_string',{"query" : "\""+businessOwner+"\"", "fields" :["bo"]});
		}
		
	
        body = body.aggregation('terms', groupAttribute,
        { 
        	order: { _term: 'desc' }, size: 999
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
        console.log(response);

        }, function (err) {
            console.trace(err.message);
        });

}


function textToTimestamp(text){
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