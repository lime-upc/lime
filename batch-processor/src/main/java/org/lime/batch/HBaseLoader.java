package org.lime.batch;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.HBaseAdmin;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.io.ImmutableBytesWritable;
import org.apache.hadoop.hbase.mapreduce.TableInputFormat;
import org.apache.hadoop.hbase.protobuf.ProtobufUtil;
import org.apache.hadoop.hbase.protobuf.generated.ClientProtos;
import org.apache.hadoop.hbase.util.Base64;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;

import java.io.IOException;

/**
 * This class abstracts loading tuples from HBase in a range.
 */
public class HBaseLoader {


	public static JavaRDD<LocationBean> getLocationsInRangeRDD(JavaSparkContext spark,DateDTO start, DateDTO end) throws Exception{

		String startDate = start.getFullDate();
		String endDate = end.getFullDate();

		//Load Hbase config
		Configuration hbaseConf = HBaseConfiguration.create();
		hbaseConf.set("hbase.master", "*" + "192.168.56.20" + ":9000*");
		hbaseConf.set("hbase.zookeeper.quorum","192.168.56.20");
		hbaseConf.set("hbase.zookeeper.property.clientPort", "2181");
		hbaseConf.set(TableInputFormat.INPUT_TABLE, "location");


		System.out.println("From " + startDate + " to " + endDate);
		Scan scan = new Scan(Bytes.toBytes(startDate),Bytes.toBytes(endDate)); //creating a scan object with start and stop row keys

		scan.setCaching(500);
		scan.setCacheBlocks(false);
		hbaseConf.set(TableInputFormat.SCAN, convertScanToString(scan));
		HBaseAdmin.checkHBaseAvailable(hbaseConf);

		JavaPairRDD<ImmutableBytesWritable, Result> hbaseRDD = spark.newAPIHadoopRDD(hbaseConf, TableInputFormat.class, ImmutableBytesWritable.class, Result.class);

		//With this, we have an RDD  with the location objects!
		return hbaseRDD.map(tuple ->
		{
			LocationBean bean = new LocationBean();
			try{

				Result result = tuple._2();
				//Set position attributes
				bean.setLat(Bytes.toDouble(result.getValue(Bytes.toBytes("position"),Bytes.toBytes("lat"))));
				bean.setLon(Bytes.toDouble(result.getValue(Bytes.toBytes("position"),Bytes.toBytes("long"))));
				bean.setCell(Bytes.toString(result.getValue(Bytes.toBytes("position"),Bytes.toBytes("cell"))));

				//Set user attributes
				bean.setEmail(Bytes.toString(result.getValue(Bytes.toBytes("user"),Bytes.toBytes("email"))));


				//Set time attributes
				bean.setTimestamp(Bytes.toLong(result.getValue(Bytes.toBytes("time"),Bytes.toBytes("timestamp"))));
				bean.setYear(Bytes.toInt(result.getValue(Bytes.toBytes("time"),Bytes.toBytes("year"))));
				bean.setMonth(Bytes.toInt(result.getValue(Bytes.toBytes("time"),Bytes.toBytes("month"))));
				bean.setDay(Bytes.toInt(result.getValue(Bytes.toBytes("time"),Bytes.toBytes("day"))));
				bean.setHour(Bytes.toInt(result.getValue(Bytes.toBytes("time"),Bytes.toBytes("hour"))));
				bean.setMinute(Bytes.toInt(result.getValue(Bytes.toBytes("time"),Bytes.toBytes("minute"))));
				bean.setSecond(Bytes.toInt(result.getValue(Bytes.toBytes("time"),Bytes.toBytes("second"))));
				return bean;
			}
			catch(Exception e){
				e.printStackTrace();
				return null;
			}

		});
	}

	static String convertScanToString(Scan scan) throws IOException {
		ClientProtos.Scan proto = ProtobufUtil.toScan(scan);
		return Base64.encodeBytes(proto.toByteArray());
	}
}
