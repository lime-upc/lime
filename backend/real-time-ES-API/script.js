var elasticsearch = require('elasticsearch');
var bodybuilder = require('bodybuilder')


var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});


//var body = bodybuilder().query('match', 'MGRS_coord', '37NGC65272411').build()

var body = bodybuilder().aggregation('terms', 'MGRS_coord').build()

client.search({
  index: 'locations',
  type: 'loc',
  body: body
}).then(function (resp) {
    var hits = resp.hits.hits;
    console.trace(hits);
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
