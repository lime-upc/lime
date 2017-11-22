package org.lime.lakeglue;

import com.twitter.bijection.Injection;
import com.twitter.bijection.avro.GenericAvroCodecs;
import kafka.serializer.DefaultDecoder;
import kafka.serializer.StringDecoder;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericRecord;
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
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import org.apache.spark.streaming.kafka.*;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class Main {

    public static final String SCHEMA = "{\n"
			+ "    \"name\": \"LocationType\","
			+ "    \"type\": \"record\","
			+ "    \"fields\": ["
			+ "        {"
			+ "            \"name\": \"email\","
			+ "            \"type\": \"string\""
			+ "        },"
			+ "        {"
			+ "            \"name\": \"timestamp\","
			+ "            \"type\": \"double\""
			+ "        },"
			+ "        {"
			+ "            \"name\": \"lat\","
			+ "            \"type\": \"double\""
			+ "        },"
			+ "        {"
			+ "            \"name\": \"long\","
			+ "            \"type\": \"double\""
			+ "        }"
			+ "    ]"
			+ "}";


    public static void main(String[] args) throws Exception {

        SparkConf conf = new SparkConf().setAppName("03_Spark").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);




        JavaStreamingContext jsc = new JavaStreamingContext(ctx, new Duration(1000));
        LogManager.getRootLogger().setLevel(Level.ERROR);

        Map<String,String> kafkaParams = new HashMap<>();
        kafkaParams.put("metadata.broker.list","192.168.56.20:9092"); //Kafka in localhost
        Set<String> topics = Collections.singleton("lime-location");	//Topic

		//Create Stream as KafkaStream
		JavaPairInputDStream<String, byte[]> directKafkaStream = KafkaUtils.createDirectStream(jsc,
				String.class, byte[].class, StringDecoder.class, DefaultDecoder.class, kafkaParams, topics);


		//TODO: Maybe, I need to save also the <String,byte[]> because it is the key?
		//Try later to read from HDFS and we will see
		JavaDStream<byte[]>  bytesKafkaStream = directKafkaStream.map(t -> t._2());



		SimpleDateFormat sdf = new SimpleDateFormat("yyyy_MM_dd_HH_mm_ss");

		bytesKafkaStream.dstream().saveAsObjectFiles("hdfs://192.168.56.20:9000/lime/location",sdf.format(new Date()));



		//directKafkaStream.saveAsHadoopFiles();
		//.saveAsHadoopFiles("/home/idrodriguez/avro","txt",String.class,byte[].class,byte[].class);
//		serializedStream.foreachRDD(rdd -> {
//			rdd.saveAsTextFile("/home/irodriguez/avro");
//		});


        directKafkaStream.foreachRDD(rdd ->{

            rdd.foreach(avroRecord -> {

				//HDFSLocationWriter hdfsWriter  = new HDFSLocationWriter();
				//hdfsWriter.openFile("kafkaTest.txt");

                Schema.Parser parser = new Schema.Parser();
                Schema schema = parser.parse(SCHEMA);
                Injection<GenericRecord, byte[]> recordInjection = GenericAvroCodecs.toBinary(schema);
                GenericRecord record = recordInjection.invert(avroRecord._2).get();


                //Record contains now the data. Now, we store it to HDFS.



                String data = "email=" + record.get("email") + ", lat=" + record.get("lat") + ", long=" + record.get("long") + "\n";
                System.out.println(data);
                //hdfsWriter.writeData(data);
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