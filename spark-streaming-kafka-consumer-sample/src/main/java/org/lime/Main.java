package org.lime;

import kafka.serializer.DefaultDecoder;
import kafka.serializer.StringDecoder;
import org.apache.avro.io.BinaryDecoder;
import org.apache.avro.io.BinaryEncoder;
import org.apache.avro.io.DatumWriter;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.io.EncoderFactory;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.avro.specific.SpecificDatumWriter;
import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.streaming.Duration;
import org.apache.spark.streaming.api.java.JavaPairInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import org.apache.spark.streaming.kafka.*;

import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class Main {


    public static void main(String[] args) throws Exception {

        SparkConf conf = new SparkConf().setAppName("03_Spark").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);

        JavaStreamingContext jsc = new JavaStreamingContext(ctx, new Duration(1000));
        LogManager.getRootLogger().setLevel(Level.ERROR);

        Map<String,String> kafkaParams = new HashMap<>();
        kafkaParams.put("metadata.broker.list","localhost:9092"); //Kafka in localhost
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

                String data = "email=" + t.getEmail() + ", lat=" + t.getLat() + ", long=" + t.getLong$();
                System.out.println(data);

                //Do something with the data
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
}