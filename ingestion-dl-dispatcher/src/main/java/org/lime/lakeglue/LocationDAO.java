package org.lime.lakeglue;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.HBaseAdmin;
import org.apache.hadoop.hbase.client.HTable;
import org.apache.hadoop.hbase.client.HTableInterface;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.util.Bytes;

import java.io.IOException;
import java.sql.Time;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class LocationDAO {

	private HTableInterface table = null;
	Configuration conf = null;

	public static final String tableName = "location";
	public static final byte[] TABLE_NAME = Bytes.toBytes(tableName);


	public LocationDAO() throws Exception {
		Configuration hbaseConf = HBaseConfiguration.create();
		hbaseConf.set("hbase.master", "*" + "192.168.56.20" + ":9000*");
		hbaseConf.set("hbase.zookeeper.quorum","192.168.56.20");
		hbaseConf.set("hbase.zookeeper.property.clientPort", "2181");
		HBaseAdmin.checkHBaseAvailable(hbaseConf);

		this.conf = hbaseConf;
		this.table = new HTable(conf, TABLE_NAME);
	}



	public void writeToHBase(LocationType location, String grid) throws IOException{
		table.put(convertToPut(location,grid));
	}


	public Put convertToPut(LocationType location, String cell) {

		Calendar cal = Calendar.getInstance();
		cal.setTimeInMillis(location.getTimestamp());
		int year = cal.get(Calendar.YEAR);
		int month = cal.get(Calendar.MONTH);
		int day = cal.get(Calendar.DAY_OF_MONTH);
		int hour = cal.get(Calendar.HOUR_OF_DAY);
		int minute = cal.get(Calendar.MINUTE);
		int second = cal.get(Calendar.SECOND);

		String formattedMonth = String.format("%02d", month);
		String formattedDay = String.format("%02d", day);
		String formattedHour = String.format("%02d", hour);
		String formattedMinute = String.format("%02d", minute);
		String formattedSecond = String.format("%02d", second);

		//key: isma@mail.com_YYYYMMDDhhmmss
		String rowKey = year + formattedMonth + formattedDay +
				formattedHour + formattedMinute + formattedSecond + "_" +  location.getEmail();

		Put put = new Put(Bytes.toBytes(rowKey));
		put.addColumn(Bytes.toBytes("position"),Bytes.toBytes("lat"),Bytes.toBytes(location.getLat()));
		put.addColumn(Bytes.toBytes("position"),Bytes.toBytes("long"),Bytes.toBytes(location.getLat()));
		put.addColumn(Bytes.toBytes("position"),Bytes.toBytes("cell"),Bytes.toBytes(cell));

		put.addColumn(Bytes.toBytes("user"),Bytes.toBytes("email"),Bytes.toBytes(location.getEmail().toString()));


		put.addColumn(Bytes.toBytes("time"),Bytes.toBytes("timestamp"),Bytes.toBytes(location.getTimestamp()));
		put.addColumn(Bytes.toBytes("time"),Bytes.toBytes("year"),Bytes.toBytes(year));
		put.addColumn(Bytes.toBytes("time"),Bytes.toBytes("month"),Bytes.toBytes(month));
		put.addColumn(Bytes.toBytes("time"),Bytes.toBytes("day"),Bytes.toBytes(day));
		put.addColumn(Bytes.toBytes("time"),Bytes.toBytes("hour"),Bytes.toBytes(hour));
		put.addColumn(Bytes.toBytes("time"),Bytes.toBytes("minute"),Bytes.toBytes(minute));
		put.addColumn(Bytes.toBytes("time"),Bytes.toBytes("second"),Bytes.toBytes(second));


		return put;
	}


}
