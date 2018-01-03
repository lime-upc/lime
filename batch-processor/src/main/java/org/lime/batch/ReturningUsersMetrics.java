package org.lime.batch;

import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.lime.batch.beans.TransactionBean;
import org.lime.batch.resultDTOs.RankingElement;
import org.lime.batch.resultDTOs.ReturningUsersResults;
import scala.Tuple2;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ReturningUsersMetrics {


	public static ReturningUsersResults calculateMetrics(JavaRDD<TransactionBean> transactions){


		//<<boMail,userMail>,1>, a tuple for each transaction
		JavaPairRDD<Tuple2<String,String>,Integer> transactionsWithMails = transactions.mapToPair(tx ->
			new Tuple2<>(new Tuple2<>(tx.getBusiness_owner(),tx.getUser()),1)
		);

		//<boMail,userMail>,N>, where N is number of transactions of userMail in business identified by boMail
		JavaPairRDD<Tuple2<String,String>,Integer> transactionsByUserAndBo = transactionsWithMails.reduceByKey(
				(a,b) -> a+b
		);

		//RESULT: <boMail,N>, being N the number of unique users in business identified by boMail
		JavaPairRDD<String,Integer> uniqueUsersByBo = transactionsByUserAndBo
				.mapToPair(tub -> new Tuple2<>(tub._1()._1(),1)) //1 tuple per unique user on the business
				.reduceByKey((a,b) -> a+b);


		//RESULT: <boMail,N>, being N the number of unique users in business identified by boMail, with more than 1 transaction
		JavaPairRDD<String,Integer> uniqueRepeatingUsersByBo = transactionsByUserAndBo
				.filter(x -> x._2()>1) //Only those with more than 1 transaction
				.mapToPair(tub -> new Tuple2<>(tub._1()._1(),1)) //1 tuple per unique user on the business
				.reduceByKey((a,b) -> a+b);


		//RESULT: <<boMail,frequency>,Number of unique users with that visit frequency>
		JavaPairRDD<Tuple2<String,Integer>,Integer> frequenciesByBo = transactionsByUserAndBo
				.filter(x -> x._2()>1) //Only those with more than 1 transaction    
				.mapToPair(t -> new Tuple2<>(new Tuple2<>(t._1()._1(),t._2()),1))
				.reduceByKey((a,b) -> a+b);

		HashMap<String,Integer> uniqueUsers = new HashMap<>();
		for(Tuple2<String,Integer> t: uniqueUsersByBo.collect()){
			String boMail = t._1();
			Integer count = t._2();
			uniqueUsers.put(boMail,count);
		}

		HashMap<String,Integer> returningUsers = new HashMap<>();
		for(Tuple2<String,Integer> t: uniqueRepeatingUsersByBo.collect()){
			String boMail = t._1();
			Integer count = t._2();
			returningUsers.put(boMail,count);
		}

		HashMap<String,List<RankingElement>> frequencies = new HashMap<>();
		for(Tuple2<Tuple2<String,Integer>,Integer> t: frequenciesByBo.collect()){
			String bo = t._1()._1();
			List<RankingElement> boList = frequencies.getOrDefault(bo,new ArrayList<>());
			RankingElement element = new RankingElement();
			element.setName(String.valueOf(t._1()._2()));
			element.setQuantity(t._2());
			boList.add(element);
			frequencies.put(bo,boList);
		}

		ReturningUsersResults res = new ReturningUsersResults();

		res.setBoUniqueUsers(uniqueUsers);
		res.setBoReturningUsers(returningUsers);
		res.setBoFrequencies(frequencies);

		return res;

	}
}
