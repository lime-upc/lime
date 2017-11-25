package org.lime.lakeglue;

import kafka.serializer.DefaultDecoder;
import kafka.serializer.StringDecoder;
import org.apache.avro.io.BinaryDecoder;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.streaming.Duration;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import org.apache.spark.streaming.kafka.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class Main {



    public static void main(String[] args) throws Exception {
		//LogManager.getRootLogger().setLevel(Level.ERROR);


		//Spark parameters
        SparkConf conf = new SparkConf().setAppName("03_Spark").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);
		JavaStreamingContext jsc = new JavaStreamingContext(ctx, new Duration(1000));


		//Kafka-connection parameters
        Map<String,String> kafkaParams = new HashMap<>();
        kafkaParams.put("metadata.broker.list","192.168.56.20:9092"); //Kafka in localhost
        Set<String> topics = Collections.singleton("lime-location");		//Topic


		//Create Stream as KafkaStream
		JavaPairInputDStream<String, byte[]> directKafkaStream = KafkaUtils.createDirectStream(jsc,
				String.class, byte[].class, StringDecoder.class, DefaultDecoder.class, kafkaParams, topics);

		//Deserialized AVRO Records
		JavaDStream<LocationType>  locationStream = directKafkaStream.map(t -> deserialize(t._2()));

		//Now, save each record to HBase
		locationStream.foreachRDD(rdd ->{
			rdd.foreach(location -> {

				//Write tuple to HBase
				LocationDAO dao = new LocationDAO();

				//Pre-calculate grid cell (10m precission)
				CoordinateConversion coordConverter = new CoordinateConversion();

				String MGRScoord1 = coordConverter.latLon2MGRUTM(location.getLat(), location.getLong$());
				String MGRScoord10 = MGRScoord1.substring(0,MGRScoord1.length()-2); // MGRS coordinates with 10 meters precision

				//Save location and the cell into HBase
				dao.writeToHBase(location,MGRScoord10);

				//Record contains now the data. Now, we store it to HDFS.
				//String data = "timestamp=" + location.getTimestamp() + ", email=" + location.get("email") + ", lat=" + location.get("lat") + ", long=" + location.get("long") + "\n";
				//System.out.println(data);
			});
		});


		jsc.start();
        jsc.awaitTermination();

    }


	/**
	 * Use this to get the LocationType object from avro serialized bytes.
	 */
	private static LocationType deserialize(byte[] bytes) throws Exception {


		SpecificDatumReader<LocationType> datumReader = new SpecificDatumReader<>(LocationType.class);

		BinaryDecoder decoder = DecoderFactory.get().binaryDecoder(bytes, null);
		return datumReader.read(null,decoder);

	}


}