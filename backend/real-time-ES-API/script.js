var elasticsearch = require('elasticsearch');
var bodybuilder = require('bodybuilder')


var client = new elasticsearch.Client({
  host: 'localhost:9200',
  //log: 'trace'
});


//var body = bodybuilder().query('match', 'MGRS_coord', '37NGC65272411').build()

var body = bodybuilder()
//.query('match', 'gender', 'male')
//.query('match', 'gender', 'female')
//.query('range', 'age', {gt: 25})
//.query('range', 'age', {lt: 30})
.aggregation('terms', 'MGRS_coord')
.build()

client.search({
  index: 'locations',
  type: 'loc',
  body: body
}).then(function (resp) {
    var hits = resp.hits.hits;
    console.log(hits)

	var aggregationsArray = resp.aggregations.agg_terms_MGRS_coord.buckets;
    for (var i = 0; i < aggregationsArray.length; i++) {
    	var key = aggregationsArray[i].key;
    	var doc_count = aggregationsArray[i].doc_count;
    	console.log(key + ": " + doc_count);
	}

}, function (err) {
    console.trace(err.message);
});




/*
client.search({
  index: 'locations',
  type: 'loc',
  body: {
    query: {
      match: {
        MGRS_coord: '37NGC65272411'
      }
    }
  }
}).then(function (resp) {
    var hits = resp.hits.hits;
    console.trace(hits);
}, function (err) {
    console.trace(err.message);
});
*/
