package org.lime;

import kafka.serializer.DefaultDecoder;
import kafka.serializer.StringDecoder;
import org.apache.avro.io.*;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.avro.specific.SpecificDatumWriter;
import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.streaming.Duration;
import org.apache.spark.streaming.api.java.JavaPairInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import org.apache.spark.streaming.kafka.KafkaUtils;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.rest.RestStatus;
import org.elasticsearch.transport.client.PreBuiltTransportClient;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.*;

import static org.elasticsearch.common.xcontent.XContentFactory.jsonBuilder;

public class Main {


    public static void main(String[] args) throws Exception {
/*

        SparkConf conf = new SparkConf().setAppName("03_spark").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);

        JavaStreamingContext jsc = new JavaStreamingContext(ctx, new Duration(1000));
        LogManager.getRootLogger().setLevel(Level.ERROR);

        Map<String,String> kafkaParams = new HashMap<>();
        kafkaParams.put("metadata.broker.list","192.168.56.20:9092"); //Kafka in VM
        Set<String> topics = Collections.singleton("lime-location");	//Topic

        //Create Stream as KafkaStream
        JavaPairInputDStream<String, byte[]> directKafkaStream = KafkaUtils.createDirectStream(jsc,
                String.class, byte[].class, StringDecoder.class, DefaultDecoder.class, kafkaParams, topics);


        directKafkaStream.foreachRDD(rdd ->{

            rdd.foreach(avroRecord -> {

                //We receive pairs key-value, where the value is avro-serialized data.
                byte[] encodedAvroData = avroRecord._2;
                //We need to deserialize data to access the object
                LocationType t = deserialize(encodedAvroData);
                String email = t.getEmail().toString();
                String lat = t.getLat().toString();
                String lon = t.getLong$().toString();
                // Creating a Mongo client for each RDD (as suggested here to avoid serialization problems: http://spark.apache.org/docs/latest/streaming-programming-guide.html#design-patterns-for-using-foreachrdd)

                MongoClientOptions.Builder options_builder = new MongoClientOptions.Builder();
                //added to set avoid "com.mongodb.MongoSocketReadException: Prematurely reached end of stream", but still not enough
                options_builder.maxConnectionIdleTime(60000);
                MongoClientOptions options = options_builder.build();
                MongoClient mongo = new MongoClient ("localhost:27017", options);


                // Accessing the database and the collections
                MongoDatabase database = mongo.getDatabase("lime");
                MongoCollection<Document> usersCollection = database.getCollection("users");
                MongoCollection<Document> spatialDBCollection = database.getCollection("spatialDB");

                Document myDoc = usersCollection.find(eq("email", email)).first();
                Integer age = calculateAge(myDoc.get("date_of_birth").toString(), LocalDate.now());

                String data = "email=" + email + ", gender=" + myDoc.get("gender") + ", date_of_birth=" + myDoc.get("date_of_birth") + ", age=" + age + ", lat=" + lat + ", long=" + lon;
                System.out.println(data);

                mongo.close();

            });
        });


        jsc.start();
        jsc.awaitTermination();

*/

        saveInElasticSearch();
    }

    public static void saveInElasticSearch() throws IOException {

        // on startup
        TransportClient client = new PreBuiltTransportClient(Settings.EMPTY)
                .addTransportAddress(new TransportAddress(InetAddress.getByName("localhost"), 9300));

        //Create object 1
        XContentBuilder builder1 = jsonBuilder()
                .startObject()
                .field("user", "kimchy")
                .field("postDate", new Date())
                .field("message", "message 1")
                .endObject();

        //Create object 2
        XContentBuilder builder2 = jsonBuilder()
                .startObject()
                .field("user", "ken")
                .field("postDate", new Date())
                .field("message", "message 2")
                .endObject();

        //add object to index and get it
        IndexResponse response1 = client.prepareIndex("twitter", "tweet", "1")
                .setSource(builder1)
                .get();

        //add object to index and get it
        IndexResponse response2 = client.prepareIndex("twitter", "tweet", "6")
                .setSource(builder2)
                .get();

        GetResponse responseGet = client.prepareGet("twitter", "tweet", "1").get();
        System.out.println(responseGet);

        //Search with filters
        SearchResponse responseSearch = client.prepareSearch("twitter")
                .setTypes("tweet")
                .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                .setQuery(QueryBuilders.termQuery("user", "kimchy")) // Query
                //.setPostFilter(QueryBuilders.rangeQuery("age").from(12).to(18)) // Filter
                .get();

        System.out.println("\nSeach results: \n"+responseSearch+"\n");

        // MatchAll on the whole cluster with all default options
        SearchResponse responseSearchAll = client.prepareSearch().get();
        System.out.println("Seach ALL: \n"+responseSearchAll);


        // on shutdown
        //client.close();

    }


    /**
     * Use this to get the LocationType object from avro serialized bytes.
     */
    public static LocationType deserialize(byte[] bytes) throws Exception {


        SpecificDatumReader<LocationType> datumReader = new SpecificDatumReader<>(LocationType.class);

        BinaryDecoder decoder = DecoderFactory.get().binaryDecoder(bytes, null);
        return datumReader.read(null,decoder);

    }


    /**
     * Use this to get avro serialization bytes from object.
     */
    public static byte[] serialize(LocationType object) throws Exception{

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        BinaryEncoder encoder = EncoderFactory.get().binaryEncoder(out, null);
        DatumWriter<LocationType> writer = new SpecificDatumWriter<LocationType>(LocationType.getClassSchema());

        writer.write(object, encoder);
        encoder.flush();
        out.close();
        return out.toByteArray();


    }


    public static int calculateAge(String birthDateString, LocalDate currentDate) {

        DateFormat format = new SimpleDateFormat("EEE MMM dd HH:mm:ss Z yyyy", Locale.ENGLISH);
        Date birthDate = null;
        try {
            birthDate = format.parse(birthDateString);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        LocalDate localBirthDate = birthDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

        if ((birthDate != null) && (currentDate != null)) {
            return Period.between(localBirthDate, currentDate).getYears();
        } else {
            return 0;
        }
    }

}