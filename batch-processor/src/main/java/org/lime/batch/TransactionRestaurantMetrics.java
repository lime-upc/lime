package org.lime.batch;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.storage.StorageLevel;
import org.bson.Document;
import org.lime.batch.beans.RestaurantBean;
import org.lime.batch.beans.TransactionBean;
import org.lime.batch.resultDTOs.RankingElement;
import org.lime.batch.resultDTOs.TransactionRestaurantResults;
import scala.Tuple2;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;

public class TransactionRestaurantMetrics {

	public static TransactionRestaurantResults getMetrics(JavaRDD<TransactionBean> transactions){




		//<boMail,Transaction>: useful later for joining with restaurants
		JavaPairRDD<String,TransactionBean> transactionsByBO  = transactions.mapToPair(tx ->
				new Tuple2<>(tx.getBusiness_owner(),tx)
		);



		//<boMail,count>: useful for only querying each restaurant once, independently of number of transactions
		JavaPairRDD<String,Integer> boCount  = transactions.mapToPair(t ->
				new Tuple2<>(t.getBusiness_owner(),1)
		).reduceByKey((a,b) -> a+b);


		//<boMail,RestaurantBean>: for each business owner, also information of restaurant retrieved from MongoDB
		JavaPairRDD<String,RestaurantBean> boProfiles = boCount.mapToPair(tuple -> {
			MongoClient mongo = new MongoClient ("localhost:27017");

			MongoDatabase database = mongo.getDatabase("lime");
			MongoCollection<Document> businessesCollection = database.getCollection("businesses");

			Document restaurantDoc = businessesCollection.find(eq("email", tuple._1())).first();
			RestaurantBean restaurant = new RestaurantBean(restaurantDoc);
			mongo.close();
			return new Tuple2<>(restaurant.getEmail(),restaurant);

		});


		//<boMail,<TransactionBean,RestaurantBean>>: Each transaction with enriched information
		JavaPairRDD<String,Tuple2<TransactionBean,RestaurantBean>> transactionsWithRes = transactionsByBO.join(boProfiles);

		//We persist information as we divide in two branches
		transactionsWithRes.persist(StorageLevel.MEMORY_AND_DISK());


		//<RestaurantID,<count,RestaurantBean>>: for each restaurant, number of transactions with the RestaurantBean object
		JavaPairRDD<String,Tuple2<Integer,RestaurantBean>> restaurantCount = transactionsWithRes.mapToPair(t -> {

			return new Tuple2<>(t._2()._2().getRestaurantId() ,new Tuple2<>(1,t._2()._2()));
		}
		).reduceByKey((a,b) -> new Tuple2<>(a._1() + b._1(),a._2()));


		//<Restaurant name with street, totalCount> (unordered): total count for each restaurant, but instead of
		//id we have the name of the restaurant and part of the street
		JavaPairRDD<String,Integer> restaurantCountWithName = restaurantCount.mapToPair(t -> {
			String street = t._2()._2().getRestaurantAddress().split(",")[0];
			String fullName = t._2()._2().getRestaurantName() + " (" + street + ")";
			return new Tuple2<>(fullName,t._2()._1());
		});



		//RESULT: <Restaurant name with street, totalCount> (ordered)
		JavaPairRDD<Integer,String> restaurantRanking = restaurantCountWithName.mapToPair(t -> t.swap()).sortByKey(false);


		//RESULT: <Count,Tag> (ordered): Ranking of tags
		JavaPairRDD<Integer,String> tagsRanking = transactionsWithRes
				.flatMap(t -> t._2()._2().getTags().iterator())		//1 tuple <Tag> per tag in any restaurant implied in transaction
				.mapToPair(t -> new Tuple2<>(t,1))				//1 tuple <Tag,1> per each of previous tuples
				.reduceByKey((a,b) -> a+b)							//Reduce to <Tag,count> to have count of each tag
				.mapToPair(t -> t.swap())							//Swap to <count,Tag> to be able to order
				.sortByKey(false);									//<count,Tag> ordered by count, desc.




		//Top 30 of restaurants with percentages, not number
		Long totalTransactions = transactions.count();
		List<RankingElement> resRankingResult = new ArrayList<>();
		for(Tuple2<Integer,String> restaurant: restaurantRanking.take(30)){
			RankingElement element = new RankingElement();
			element.setName(restaurant._2());
			element.setPercentage(((double) restaurant._1() / (double) totalTransactions)*100.0);
			resRankingResult.add(element);
		}


		//Top 30 tags, with number of transactions
		List<RankingElement> tagRankingResult = new ArrayList<>();
		for(Tuple2<Integer,String> tag: tagsRanking.take(30)){
			RankingElement element = new RankingElement();
			element.setName(tag._2());
			element.setPercentage(((double) tag._1() / (double) totalTransactions)*100.0);
			element.setQuantity(tag._1());
			tagRankingResult.add(element);
		}




		//Set resultDTOs
		TransactionRestaurantResults results = new TransactionRestaurantResults();

		results.setRestaurantRanking(resRankingResult);
		results.setTagRanking(tagRankingResult);

		return results;


	}
}
