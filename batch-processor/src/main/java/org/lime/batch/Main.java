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
        String today = "16/01/2018";


        //Get all the locations from previous month
		//NOTE: Not used, but could be used to do batch analytics with the location data from the Data Lake. Works.
		//System.out.println("Reading location data from Data Lake (HBase)");
        //JavaRDD<LocationBean> locations = HBaseLoader.getLocationsForPastMonth(ctx,today);

		long start;
		long end;

		long totalStart;
		long totalEnd;
		totalStart = System.currentTimeMillis();
		System.out.println("Reading transaction data from MongoDB (today)");
		start = System.currentTimeMillis();
		JavaRDD<TransactionBean> todayTransactions  = TransactionsLoader.getConfirmedTransactionsForDayRDD(ctx,today);
		end = System.currentTimeMillis();
		System.out.println("\t\t**Time: " + ((end - start)/1000.0) + " .s");
		System.out.println("Reading transaction data from MongoDB (last month)");
		start = System.currentTimeMillis();
		JavaRDD<TransactionBean> lastMonthTransactions = TransactionsLoader.getConfirmedTransactionsForPastMonth(ctx,today);
		end = System.currentTimeMillis();
		System.out.println("\t\t**Time: " + ((end - start)/1000.0) + " .s");

		//Persist as this RDD is used by different branches
		todayTransactions.persist(StorageLevel.MEMORY_AND_DISK());
		lastMonthTransactions.persist(StorageLevel.MEMORY_AND_DISK());

		//First, the profile calculations. Are done every day, with data of previous day only.
		//Note: If it was not calculated for previous days because we forgot, just increase period.
		System.out.println("Transaction and profile stats");
		System.out.println("\t*Calculating...");
		start = System.currentTimeMillis();
		TransactionProfileResults res = TransactionProfileMetrics.calculateMetrics(todayTransactions);
		end = System.currentTimeMillis();
		System.out.println("\t\t**Time: " + ((end - start)/1000.0) + " .s");
		//IMPORTANT: to calculate data from past month, call next line
		//TransactionProfileResults res = TransactionProfileMetrics.calculateMetrics(lastMonthTransactions);
		System.out.println("\t*Saving into ES...");
		start = System.currentTimeMillis();
		ElasticSearchWriter.writeNewResults(res);
		end = System.currentTimeMillis();
		System.out.println("\t\t**Time: " + ((end - start)/1000.0) + " .s");
		res.setEmpty();
		System.out.println("\t*Done\n");

		//Second, the restaurants and returning user calculations. Done every day, with data from whole month.
		System.out.println("Transaction and restaurants stats");
		System.out.println("\t*Calculating...");
		start = System.currentTimeMillis();
		TransactionRestaurantResults trResults = TransactionRestaurantMetrics.getMetrics(lastMonthTransactions);
		end = System.currentTimeMillis();
		System.out.println("\t\t**Time: " + ((end - start)/1000.0) + " .s");
		System.out.println("\t*Saving into ES...");
		start = System.currentTimeMillis();
		ElasticSearchWriter.writeTransactionRestaurantResults(trResults);
		end = System.currentTimeMillis();
		System.out.println("\t\t**Time: " + ((end - start)/1000.0) + " .s");
		trResults.setEmpty();
		System.out.println("\t*Done\n");

		System.out.println("Returning users stats");
		System.out.println("\t*Calculating...");
		start = System.currentTimeMillis();
		ReturningUsersResults rur = ReturningUsersMetrics.calculateMetrics(lastMonthTransactions);
		end = System.currentTimeMillis();
		System.out.println("\t\t**Time: " + ((end - start)/1000.0) + " .s");
		System.out.println("\t*Saving into ES...");
		start = System.currentTimeMillis();
		ElasticSearchWriter.writeReturningUsersResults(rur);
		end = System.currentTimeMillis();
		System.out.println("\t\t**Time: " + ((end - start)/1000.0) + " .s");

		rur.setEmpty();
		System.out.println("\t*Done\n");

		totalEnd = System.currentTimeMillis();

		System.out.println("TOTAL TIME: " + ((totalEnd - totalStart)/1000.0) + " .s");


		System.out.println("Done!");



    }


}