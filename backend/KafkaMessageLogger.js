var avro = require('avsc');
var kafka = require('kafka-node');
var Consumer = kafka.Consumer;
var Client = kafka.Client;
var config = require('./config');

var avroSchema = {
	name: 'LocationType',
	type: 'record',
	fields: [
		{
			name: 'email',
			type: 'string'
		},
		{
			name: 'timestamp',
			type: 'double'
		},
		{
			name: 'lat',
			type: 'double'
		},
		{
			name: 'long',
			type: 'double'
		}
	]
};

//1st: Create a client
var type = avro.parse(avroSchema);
var client = new Client(config.kafka_host,'my-client-id',{
	sessionTimeout: 300,
	spinDelay: 100,
	retries: 2
});


//For this demo, we just log client errors to the console
client.on('error',function(error){
	console.error(error);
});

var topics = [{
  topic: 'lime-location'
}];

var options = {
	autoCommit: true,
	fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024 * 1024,
    encoding: 'buffer' //Do not specify group, so we can consume from same
};

var consumer = new Consumer(client,topics,options);

consumer.on('message', function(message) {
	try{
		var buf = new Buffer(message.value, 'binary'); // Read string into a buffer.
  var decodedMessage = type.fromBuffer(buf.slice(0)); // Skip prefix.
  console.log(decodedMessage);
	}
	catch(error){
		
	}
  
});

consumer.on('error', function(err) {
  console.log('error', err);
});

process.on('SIGINT', function() {
  consumer.close(true, function() {
    process.exit();
  });
});