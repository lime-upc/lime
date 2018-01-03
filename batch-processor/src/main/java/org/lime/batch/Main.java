package org.lime.batch;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.storage.StorageLevel;
import org.lime.batch.beans.TransactionBean;
import org.lime.batch.externalDataLoaders.TransactionsLoader;
import org.lime.batch.externalDataWriters.ElasticSearchWriter;
import org.lime.batch.resultDTOs.TransactionProfileResults;
import org.lime.batch.resultDTOs.ReturningUsersResults;
import org.lime.batch.resultDTOs.TransactionRestaurantResults;

public class Main {


    public static void main(String[] args) throws Exception {


        SparkConf conf = new SparkConf().setAppName("Batch Processor").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);

        ctx.setLogLevel("ERROR");
        String today = "01/01/2018";


        //Get all the locations from previous month
		//NOTE: Not used, but could be used to do batch analytics with the location data from the Data Lake. Works.
		//System.out.println("Reading location data from Data Lake (HBase)");
        //JavaRDD<LocationBean> locations = HBaseLoader.getLocationsForPastMonth(ctx,today);


		System.out.println("Reading transaction data from MongoDB");
		JavaRDD<TransactionBean> todayTransactions  = TransactionsLoader.getConfirmedTransactionsForDayRDD(ctx,today);
		JavaRDD<TransactionBean> lastMonthTransactions = TransactionsLoader.getConfirmedTransactionsForPastMonth(ctx,today);

		//Persist as this RDD is used by different branches
		todayTransactions.persist(StorageLevel.MEMORY_AND_DISK());
		lastMonthTransactions.persist(StorageLevel.MEMORY_AND_DISK());

		//First, the profile calculations. Are done every day, with data of previous day only.
		//Note: If it was not calculated for previous days because we forgot, just increase period.
		System.out.println("Transaction and profile stats");
		System.out.println("\t*Calculating...");
		TransactionProfileResults res = TransactionProfileMetrics.calculateMetrics(todayTransactions);
		//IMPORTANT: to calculate data from past month, call next line
		//TransactionProfileResults res = TransactionProfileMetrics.calculateMetrics(lastMonthTransactions);
		System.out.println("\t*Saving into ES...");
		ElasticSearchWriter.writeNewResults(res);
		res.setEmpty();
		System.out.println("\t*Done\n");

		//Second, the restaurants and returning user calculations. Done every day, with data from whole month.
		System.out.println("Transaction and restaurants stats");
		System.out.println("\t*Calculating...");
		TransactionRestaurantResults trResults = TransactionRestaurantMetrics.getMetrics(lastMonthTransactions);
		System.out.println("\t*Saving into ES...");
		ElasticSearchWriter.writeTransactionRestaurantResults(trResults);
		trResults.setEmpty();
		System.out.println("\t*Done\n");

		System.out.println("Returning users stats");
		System.out.println("\t*Calculating...");
		ReturningUsersResults rur = ReturningUsersMetrics.calculateMetrics(lastMonthTransactions);
		ElasticSearchWriter.writeReturningUsersResults(rur);
		System.out.println("\t*Saving into ES...");
		rur.setEmpty();
		System.out.println("\t*Done\n");



        System.out.println("Done!");



    }


}