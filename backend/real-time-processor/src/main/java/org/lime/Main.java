package org.lime;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
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
import org.bson.Document;
import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsRequest;
import org.elasticsearch.action.admin.indices.mapping.put.PutMappingResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.geo.GeoPoint;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.transport.client.PreBuiltTransportClient;

import java.io.ByteArrayOutputStream;
import java.net.InetAddress;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutionException;

import static com.mongodb.client.model.Filters.eq;
import static org.elasticsearch.common.xcontent.XContentFactory.jsonBuilder;

public class Main {


    public static void main(String[] args) throws Exception {
        //Required to avoid Exceptions due to dependency conflicts on io.netty Maven dependency
        System.setProperty("es.set.netty.runtime.available.processors", "false");

        SparkConf conf = new SparkConf().setAppName("LIMERealTimeProcessor").setMaster("local[*]");
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

            rdd.foreachPartition(partitionOfRecords -> {

                //MONGODB AND ELASTICSEARCH CONNECTIONS SETUP

                // Implemented best practice: Creating a Mongo client for each RDD partition (as suggested here to avoid serialization problems and have better performance: http://spark.apache.org/docs/latest/streaming-programming-guide.html#design-patterns-for-using-foreachrdd)
                MongoClient mongo = new MongoClient ("localhost:27017");

                // Accessing the database and the collections
                MongoDatabase database = mongo.getDatabase("lime");
                MongoCollection<Document> usersCollection = database.getCollection("users");
                MongoCollection<Document> spatialDBCollection = database.getCollection("spatialDB");

                // Creating the ElasticSearch Transport client
                TransportClient client = new PreBuiltTransportClient(Settings.EMPTY)
                        .addTransportAddress(new TransportAddress(InetAddress.getByName("192.168.56.20"), 9300));

                // Mapping the field of the ElasticSearch documents to be inserted later. This step is required to set "MGRS_coord" as a keyword: aggregation/sorting operations cannot be performed on strings/text fields.
                XContentBuilder mapping = jsonBuilder()
                        .startObject()
                            .startObject("loc")
                                .startObject("properties")
                                    .startObject("MGRS_coord")
                                        .field("type", "keyword")
                                    .endObject()
                                    .startObject("location")
                                        .field("type", "geo_point")
                                    .endObject()
                                    .startObject("age")
                                        .field("type", "long")
                                    .endObject()
                                    .startObject("gender")
                                        .field("type", "text")
                                    .endObject()
                                    .startObject("last_update_timestamp")
                                        .field("type", "date")
                                    .endObject()
                                .endObject()
                            .endObject()
                        .endObject();

                boolean exists = client.admin().indices()
                        .prepareExists("locations")
                        .execute().actionGet().isExists();

                //Create index if it does not exists yet
                if (exists==false)
                    client.admin().indices().prepareCreate("locations").get();

                PutMappingResponse putMappingResponse = client.admin().indices()
                        .preparePutMapping("locations")
                        .setType("loc")
                        .setSource(mapping)
                        .execute().actionGet();

                // PROCESS EACH AVRO MESSAGE IN THE KAFKA FLOW
                while (partitionOfRecords.hasNext()) {

                    //We receive pairs key-value, where the value is avro-serialized data.
                    byte[] encodedAvroData = partitionOfRecords.next()._2;
                    //We need to deserialize data to access the object
                    LocationType t = deserialize(encodedAvroData);

                    String email = t.getEmail().toString();
                    Double lat = Double.parseDouble(t.getLat().toString());
                    Double lon = Double.parseDouble(t.getLong$().toString());
                    GeoPoint location = new GeoPoint(lat, lon);
                    
                    // Converting lat-lon coordinates into Military Grid Reference System coordinates
                    CoordinateConversion coordConverter = new CoordinateConversion();
                    String MGRScoord1 = coordConverter.latLon2MGRUTM(lat, lon); // MGRS coordinates with 1 meter precision
                    String MGRScoord10 = MGRScoord1.substring(0,9) + MGRScoord1.substring(10,MGRScoord1.length()-1); // MGRS coordinates with 10 meters precision

                    // Retrieving information about a user from mongoDB given his email address
                    Document userDoc = usersCollection.find(eq("email", email)).first();
                    Integer age = calculateAge(userDoc.get("date_of_birth").toString(), LocalDate.now());

                    //inserting (if not existing already) or updating loc object into locations ElasticSearch index
                    IndexRequest indexRequest = new IndexRequest("locations", "loc", userDoc.get("_id").toString())
                            .source(jsonBuilder()
                                    .startObject()
                                    .field("MGRS_coord", MGRScoord10)
                                    .field("location", location)
                                    .field("age", age)
                                    .field("gender", userDoc.get("gender"))
                                    .field("last_update_timestamp", new Timestamp(System.currentTimeMillis()))
                                    .endObject());

                    UpdateRequest updateRequest = new UpdateRequest("locations", "loc", userDoc.get("_id").toString())
                            .doc(jsonBuilder()
                                    .startObject()
                                    .field("MGRS_coord", MGRScoord10)
                                    .field("location", location)
                                    .field("last_update_timestamp", new Timestamp(System.currentTimeMillis()))
                                    .endObject())
                            .upsert(indexRequest);

                    try {
                        client.update(updateRequest).get();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    } catch (ExecutionException e) {
                        e.printStackTrace();
                    }

                    System.out.println(">>> Data about user "+ email +" successfully retrieved from mongoDB and added to ElasticSearch index!");

                }

                // CLOSE MONGODB AND ELASTICSEARCH CONNECTIONS
                //Close ES Transport Client >> Note: this adds an overhead in terms of time, but it is required to avoid that ES crashes
                client.close();

                //Closing the connection with mongoDB
                mongo.close();

            });
        });

        jsc.start();
        jsc.awaitTermination();
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

    /**
     * Use this to get calculate an age starting from two dates in the "EEE MMM dd HH:mm:ss Z yyyy" format.
     */

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