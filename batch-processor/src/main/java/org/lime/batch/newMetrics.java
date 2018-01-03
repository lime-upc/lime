package org.lime.batch;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.storage.StorageLevel;
import org.bson.Document;
import org.lime.batch.beans.Hour;
import org.lime.batch.beans.TransactionBean;
import org.lime.batch.beans.UserBean;
import org.lime.batch.resultDTOs.NewResults;
import org.lime.batch.resultDTOs.RankingElement;
import org.lime.batch.resultDTOs.TransactionProfileResults;
import scala.Tuple2;
import scala.Tuple3;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;

public class newMetrics {


	public static NewResults calculateMetrics(JavaRDD<TransactionBean> transactions){



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


		//We reduce by pair <boMail,userMail,hour> <<boMail,userMail,Hour>,<transactionCount,UserBean>
		JavaPairRDD<Tuple3<String,String,Hour>,Tuple2<Integer,UserBean>> groupedByBoUserHour =
				usersWithTransactions.mapToPair(ut -> {
					return new Tuple2<>(
							new Tuple3<>(ut._2()._1().getBusiness_owner(),ut._1(),new Hour(ut._2._1.getTimestamp())),new Tuple2<>(1,ut._2()._2())
					);
				}).reduceByKey((a,b) -> new Tuple2<>(a._1+b._1,a._2()) );


		groupedByBoUserHour.persist(StorageLevel.MEMORY_AND_DISK());

		//Number of transactions grouped by restaurant and user
		//uses <<boMail,userMail>,<transactionCount,UserBean>
		JavaPairRDD<Tuple2<String,String>,Integer> txNumberByBoAndUser = groupedByBoUserHour
				.mapToPair(t -> new Tuple2<>(new Tuple2<>(t._1()._1(),t._1()._2()),t._2()._1()))
				.reduceByKey((a,b) -> a+b);


		//RESULT: <<boMail,freq>,people>>: For each business owner and month frequency, number of people
		JavaPairRDD<Tuple2<String,Integer>,Integer> peopleNumberByBoAndFreq = txNumberByBoAndUser
				.mapToPair(t -> new Tuple2<>(new Tuple2<>(t._1()._1(),t._2()),1))
				.reduceByKey((a,b) -> a+b);


		//RESULT: <boMail,numberOfUniqueUsers>: For each business owner, number of unique users
		//JavaPairRDD<String,Integer> uniqueUsersByBO = groupedByBoAndUser
		//		.mapToPair(t -> new Tuple2<>(t._1()._1(),1))
		//		.reduceByKey((a,b) -> a+b);

		//RESULT: <boMail,numberOfUniqueReturningUsers>: For each business owner, number of unique returning users
		//JavaPairRDD<String,Integer> repeatingUsersByBo = groupedByBoAndUser
		//		.filter(t -> t._2()._1() > 1)
		//		.mapToPair(t -> new Tuple2<>(t._1()._1(),1))
		//		.reduceByKey((a,b) -> a+b);


		//RESULT: <<boMail,gender,hourID>,<totalCount>: For each business owner, each gender and each hour, number of transactions
		JavaPairRDD<Tuple3<String,String,Hour>,Integer> txs_bo_gender_hour = groupedByBoUserHour
				.mapToPair(g -> {
					return new Tuple2<>(new Tuple3<>(g._1()._1(),g._2()._2().getGender(),g._1()._3()),g._2()._1());
				})
				.reduceByKey((a,b) -> a+b);

		//RESULT: <<gender,hourID>,<totalCount>: In total, for each gender and each hour, number of transactions
		JavaPairRDD<Tuple2<String,Hour>,Integer> txs_gender_hour = txs_bo_gender_hour
				.mapToPair(g -> {
					return new Tuple2<>(new Tuple2<>(g._1()._2(),g._1()._3()),g._2());
				})
				.reduceByKey((a,b) -> a+b);





		//RESULT: <<boMail,age,hourID>,<totalCount>: For each business owner, each age and each hour, number of transactions
		JavaPairRDD<Tuple3<String,Integer,Hour>,Integer> txs_bo_age_hour = groupedByBoUserHour
				.mapToPair(g -> {
					Integer age = g._2()._2().getAge();
					if(age <= 10){
						age = 10;
					}
					else if(age <= 20){
						age = 20;
					}
					else if(age <= 30){
						age = 30;
					}
					else if(age <= 40){
						age = 40;
					}
					else if(age <= 50){
						age = 50;
					}
					else if(age <= 60){
						age = 60;
					}
					else if(age <= 70){
						age = 70;
					}
					else if(age <= 80){
						age = 80;
					}
					else if(age <= 90){
						age = 90;
					}
					else{
						age = 100;
					}

					return new Tuple2<>(new Tuple3<>(g._1()._1(),age,g._1()._3()),g._2()._1());
				})
				.reduceByKey((a,b) -> a+b);




		//RESULT: <<age,hourID>,<totalCount>: In total, for each age and each hour, number of transactions
		JavaPairRDD<Tuple2<Integer,Hour>,Integer> txs_age_hour = txs_bo_age_hour
				.mapToPair(g -> {
					return new Tuple2<>(new Tuple2<>(g._1()._2(),g._1()._3()),g._2());
				})
				.reduceByKey((a,b) -> a+b);

		//RESULT: <<boMail,hourID>,<totalCount>: For each business owner and each hour, number of transactions
		JavaPairRDD<Tuple2<String,Hour>,Integer> txs_bo_hour = groupedByBoUserHour
				.mapToPair(g -> {
					return new Tuple2<>(new Tuple2<>(g._1()._1(),g._1()._3()),g._2()._1());
				})
				.reduceByKey((a,b) -> a+b);

		//RESULT: <<hourID>,<totalCount>: In total, for each  hour, number of transactions
		JavaPairRDD<Hour,Integer> txs_hour = txs_bo_hour
				.mapToPair(g -> {
					return new Tuple2<>(g._1()._2(),g._2());
				})
				.reduceByKey((a,b) -> a+b);


		for(Tuple2 tup: txs_bo_gender_hour.mapToPair(t -> t.swap()).sortByKey(false).take(5)){
			System.out.println(tup);
		}

		NewResults results = new NewResults();
		results.setTxs_age_hour(txs_age_hour);
		results.setTxs_gender_hour(txs_gender_hour);
		results.setTxs_hour(txs_hour);
		results.setTxs_bo_age_hour(txs_bo_age_hour);
		results.setTxs_bo_gender_hour(txs_bo_gender_hour);
		results.setTxs_bo_hour(txs_bo_hour);

		return results;






	}
}
