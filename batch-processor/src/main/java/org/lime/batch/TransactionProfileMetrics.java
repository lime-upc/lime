package org.lime.batch;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.storage.StorageLevel;
import org.bson.Document;
import org.lime.batch.beans.TransactionBean;
import org.lime.batch.beans.UserBean;
import org.lime.batch.resultDTOs.RankingElement;
import org.lime.batch.resultDTOs.TransactionProfileResults;
import scala.Tuple2;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;

public class TransactionProfileMetrics {


	public static TransactionProfileResults calculateMetrics(JavaRDD<TransactionBean> transactions){



		//<userMail,Transaction>: Transactions with key = user email, to later join with user profile objects
		JavaPairRDD<String,TransactionBean> transactionsByUser  = transactions.mapToPair(tx ->
				new Tuple2<>(tx.getUser(),tx)
		);


		//<userEmail,count>: Number of transactions per email. Done to later only query once mongoDB per each user
		JavaPairRDD<String,Integer> emailCount  = transactions
				.mapToPair(t -> new Tuple2<>(t.getUser(),1))
				.reduceByKey((a,b) -> a+b);



		//<userEmail,UserBean>: For each user email, the user profile object filled from the MongoDB database
		JavaPairRDD<String,UserBean> usersProfiles = emailCount.mapToPair(tuple -> {
			MongoClient mongo = new MongoClient ("localhost:27017");

			MongoDatabase database = mongo.getDatabase("lime");
			MongoCollection<Document> usersCollection = database.getCollection("users");

			Document userDoc = usersCollection.find(eq("email", tuple._1())).first();
			UserBean user = new UserBean(userDoc);
			mongo.close();
			return new Tuple2<>(user.getEmail(),user);

		});


		//Transactions in <userEmail,<Transaction,User>> form
		JavaPairRDD<String,Tuple2<TransactionBean,UserBean>> usersWithTransactions =
				transactionsByUser.join(usersProfiles);


		//We reduce by pair <bo,user>, so the result is <<boMail,userMail>,<transactionCount,UserBean>>
		JavaPairRDD<Tuple2<String,String>,Tuple2<Integer,UserBean>> groupedByBoAndUser =
				usersWithTransactions.mapToPair(ut -> {
					return new Tuple2<>(new Tuple2<>(ut._2()._1().getBusiness_owner(),ut._1()),new Tuple2<>(1,ut._2()._2()));
				}).reduceByKey((a,b) -> new Tuple2<>(a._1+b._1,a._2()));

		//We persist this result as two different branches use this.
		groupedByBoAndUser.persist(StorageLevel.MEMORY_AND_DISK());


		//RESULT: <<boMail,gender>,<totalCount>: For each business owner and each gender, number of transactions
		JavaPairRDD<Tuple2<String,String>,Integer> txNumberByBoAndGender = groupedByBoAndUser
				.mapToPair(g -> {
					return new Tuple2<>(new Tuple2<>(g._1()._1(),g._2()._2().getGender()),g._2()._1());
				})
				.reduceByKey((a,b) -> a+b);


		//RESULT: <<boMail,age>,<totalCount>: For each business owner and each age, number of transactions
		JavaPairRDD<Tuple2<String,Integer>,Integer> txNumberByBoAndAge = groupedByBoAndUser
				.mapToPair(g -> {
					return new Tuple2<>(new Tuple2<>(g._1()._1(),g._2()._2().getAge()),g._2()._1());
				})
				.reduceByKey((a,b) -> a+b);


		//RESULT: <<boMail,hourOfDay>,<totalCount>: For each business owner and each hour of day, number of transactions
		JavaPairRDD<Tuple2<String,Integer>,Integer> txNumberByBoAndHour = transactions
				.mapToPair(transaction -> {
					long timestamp = transaction.getTimestamp();
					Date date = new Date(timestamp);
					DateFormat formatter = new SimpleDateFormat("HH:mm:ss:SSS");
					Integer hour = Integer.parseInt(formatter.format(date).split(":")[0]);
					return new Tuple2<>(new Tuple2<>(transaction.getBusiness_owner(),hour),1);
				})
				.reduceByKey((a,b) -> a+b);

		//* CALCULATE AGGREGATES FROM PREVIOUS RESULTS, FOR ALL THE BUSINESSES *//


		//RESULT: For hours, sorted ascending by hour
		JavaPairRDD<Integer,Integer> txNumberByHour = txNumberByBoAndHour
				.mapToPair(t ->
					new Tuple2<>(t._1()._2(),t._2())    //Now we have <Hour,Count>, one tuple for Business Owner
				)
				.reduceByKey((a,b) -> a+b).sortByKey();    //Aggregate counts

		//RESULT: For ages, sorted ascending by age
		JavaPairRDD<Integer,Integer> txNumberByAge = txNumberByBoAndAge
				.mapToPair(t ->
					new Tuple2<>(t._1()._2(),t._2())    //Now we have <Age,Count>, one tuple for Business Owner
				)
				.reduceByKey((a,b) -> a+b).sortByKey();   //Aggregate counts

		//RESULT: For gender
		JavaPairRDD<String,Integer> txNumberByGender = txNumberByBoAndGender
				.mapToPair(t ->
					new Tuple2<>(t._1()._2(),t._2())    //Now we have <Gender,Count>, one tuple for Business Owner
				)
				.reduceByKey((a,b) -> a+b);    //Aggregate counts


		//Now, we gather resultDTOs and create the objects that will be later stored into ES
		//Warning, this is done in the driver, but should not be a problem as this is aggregated data

		Long numberTransactions = transactions.count();

		//This structure facilitates later saving into ES
		HashMap<String,List<RankingElement>> bo_gender_res = new HashMap<>();
		for(Tuple2<Tuple2<String,String>,Integer> t: txNumberByBoAndGender.collect()){
			String bo = t._1()._1();
			List<RankingElement> boList = bo_gender_res.getOrDefault(bo,new ArrayList<>());
			RankingElement element = new RankingElement();
			element.setName(t._1()._2());
			element.setQuantity(t._2());
			element.setPercentage((double) t._2() * 100.0 / (double) numberTransactions);
			boList.add(element);
			bo_gender_res.put(bo,boList);
		}

		HashMap<String,List<RankingElement>> bo_age_res = new HashMap<>();
		for(Tuple2<Tuple2<String,Integer>,Integer> t: txNumberByBoAndAge.collect()){
			String bo = t._1()._1();
			List<RankingElement> boList = bo_age_res.getOrDefault(bo,new ArrayList<>());
			RankingElement element = new RankingElement();
			element.setName(String.valueOf(t._1()._2()));
			element.setQuantity(t._2());
			element.setPercentage((double) t._2() * 100.0 / (double) numberTransactions);
			boList.add(element);
			bo_age_res.put(bo,boList);
		}

		HashMap<String,List<RankingElement>> bo_hour_res = new HashMap<>();
		for(Tuple2<Tuple2<String,Integer>,Integer> t: txNumberByBoAndHour.collect()){
			String bo = t._1()._1();
			List<RankingElement> boList = bo_hour_res.getOrDefault(bo,new ArrayList<>());
			RankingElement element = new RankingElement();
			element.setName(String.valueOf(t._1()._2()));
			element.setQuantity(t._2());
			element.setPercentage((double) t._2() * 100.0 / (double) numberTransactions);
			boList.add(element);
			bo_hour_res.put(bo,boList);
		}

		List<RankingElement> ageList = new ArrayList<>();
		for(Tuple2<Integer,Integer> t: txNumberByAge.collect()){
			RankingElement e = new RankingElement();
			e.setName(String.valueOf(t._1()));
			e.setQuantity(t._2());
			e.setPercentage((double) t._2() * 100.0 / (double) numberTransactions );
			ageList.add(e);
		}

		List<RankingElement> hourList = new ArrayList<>();
		for(Tuple2<Integer,Integer> t: txNumberByHour.collect()){
			RankingElement e = new RankingElement();
			e.setName(String.valueOf(t._1()));
			e.setQuantity(t._2());
			e.setPercentage((double) t._2() * 100.0 / (double) numberTransactions );
			hourList.add(e);
		}

		List<RankingElement> genderList = new ArrayList<>();
		for(Tuple2<String,Integer> t: txNumberByGender.collect()){
			RankingElement e = new RankingElement();
			e.setName(t._1());
			e.setQuantity(t._2());
			e.setPercentage((double) t._2() * 100.0 / (double) numberTransactions );
			genderList.add(e);
		}

		TransactionProfileResults results = new TransactionProfileResults();
		results.setTxBoAge(bo_age_res);
		results.setTxBoGender(bo_gender_res);
		results.setTxBoHour(bo_hour_res);
		results.setTxAge(ageList);
		results.setTxHour(hourList);
		results.setTxGender(genderList);
		return results;

	}
}
