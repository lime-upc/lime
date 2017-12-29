package org.lime.batch.externalDataLoaders;

import com.caffinc.sparktools.mongordd.MongoRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.bson.Document;
import org.lime.batch.beans.TransactionBean;
import scala.reflect.ClassManifestFactory$;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class TransactionsLoader {

	public static JavaRDD<TransactionBean> getConfirmedTransactionsForDayRDD(JavaSparkContext ctx, String day) throws ParseException{

		DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		Date startDate = dateFormat.parse(day);
		long startTime = startDate.getTime();
		long endTime = startTime + (24 * 60 * 60 * 1000); //One day after

		String mongoClientUri = "mongodb://localhost:27017";
		String database = "lime";
		String collection = "transactions";

		//Only confirmed, for that day
		Document doc = new Document("timestamp", new Document("$gte", startTime).append("$lt", endTime));
		doc.append("status","confirmed");

		JavaRDD<Document> docs = new JavaRDD<>(
				new MongoRDD(JavaSparkContext.toSparkContext(ctx), mongoClientUri, database, collection, doc, 1),
				ClassManifestFactory$.MODULE$.fromClass(Document.class)
		);

		return docs.map(d -> {

			TransactionBean bean = new TransactionBean();
			bean.set_id(d.get("_id").toString());
			bean.setUser(d.getString("user"));
			bean.setBusiness_owner(d.getString("business_owner"));
			bean.setTimestamp(Double.valueOf(d.getDouble("timestamp")).longValue());
			bean.setPayback_amount(Double.parseDouble(d.get("payback_amount").toString()));
			bean.setTotal_amount(Double.parseDouble(d.get("total_amount").toString()));
			bean.setVirtual_money_used(Double.parseDouble(d.get("virtual_money_used").toString()));
			bean.setStatus(d.getString("status"));

			return bean;

		});
	}

	public static JavaRDD<TransactionBean> getConfirmedTransactionsForPastMonth(JavaSparkContext ctx, String today) throws ParseException{

		DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		Date todayDate = dateFormat.parse(today);

		Calendar cal = Calendar.getInstance();
		cal.setTime(todayDate);
		cal.add(Calendar.DATE, -30);
		Date dateBefore30Days = cal.getTime();

		long startTime = dateBefore30Days.getTime(); //One month ago
		long endTime = todayDate.getTime() + (24 * 60 * 60 * 1000); //One day after

		String mongoClientUri = "mongodb://localhost:27017";
		String database = "lime";
		String collection = "transactions";

		//Only confirmed, for that day
		Document doc = new Document("timestamp", new Document("$gte", startTime).append("$lt", endTime));
		doc.append("status","confirmed");

		JavaRDD<Document> docs = new JavaRDD<>(
				new MongoRDD(JavaSparkContext.toSparkContext(ctx), mongoClientUri, database, collection, doc, 1),
				ClassManifestFactory$.MODULE$.fromClass(Document.class)
		);

		return docs.map(d -> {

			TransactionBean bean = new TransactionBean();
			bean.set_id(d.get("_id").toString());
			bean.setUser(d.getString("user"));
			bean.setBusiness_owner(d.getString("business_owner"));
			bean.setTimestamp(Double.valueOf(d.getDouble("timestamp")).longValue());
			bean.setPayback_amount(Double.parseDouble(d.get("payback_amount").toString()));
			bean.setTotal_amount(Double.parseDouble(d.get("total_amount").toString()));
			bean.setVirtual_money_used(Double.parseDouble(d.get("virtual_money_used").toString()));
			bean.setStatus(d.getString("status"));

			return bean;

		});
	}
}
