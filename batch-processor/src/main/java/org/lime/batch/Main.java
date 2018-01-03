package org.lime.batch;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.storage.StorageLevel;
import org.lime.batch.beans.LocationBean;
import org.lime.batch.beans.TransactionBean;
import org.lime.batch.externalDataLoaders.HBaseLoader;
import org.lime.batch.externalDataLoaders.TransactionsLoader;
import org.lime.batch.externalDataWriters.ElasticSearchWriter;
import org.lime.batch.resultDTOs.NewResults;
import org.lime.batch.resultDTOs.ReturningUsersResults;
import org.lime.batch.resultDTOs.TransactionProfileResults;
import org.lime.batch.resultDTOs.TransactionRestaurantResults;

public class Main {


    public static void main(String[] args) throws Exception {


        SparkConf conf = new SparkConf().setAppName("Batch Processor").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);

        ctx.setLogLevel("ERROR");
        String today = "02/01/2018";

        //Get all the locations from previous month
        //JavaRDD<LocationBean> locations = HBaseLoader.getLocationsForPastMonth(ctx,today);

        //Get all the confirmed transactions for yesterday as a RDD, for all the Business Owners
        //JavaRDD<TransactionBean> transactions  = TransactionsLoader.getConfirmedTransactionsForDayRDD(ctx,today);

        //Get all the confirmed transactions for previous month as a RDD, for all the Business Owners
        JavaRDD<TransactionBean> transactions = TransactionsLoader.getConfirmedTransactionsForPastMonth(ctx,today);


        //Persist as this RDD is used by different branches
        transactions.persist(StorageLevel.MEMORY_AND_DISK());


        //Do the processing, and obtain objects ready to save into ElasticSearch
        System.out.println("Calculating users metrics...");
        //NewResults res = newMetrics.calculateMetrics(transactions);
        System.out.println("Calculating restaurant and tags metrics...");
        TransactionRestaurantResults trResults = TransactionRestaurantMetrics.getMetrics(transactions);


        //Save resultDTOs into elasticSearch
        System.out.println("Saving results to ElasticSearch...");

        //ElasticSearchWriter.writeNewResults(res);
        ElasticSearchWriter.writeTransactionRestaurantResults(trResults,today);
        System.out.println("Done!");

        ReturningUsersResults rur = ReturningUsersMetrics.calculateMetrics(transactions);
        ElasticSearchWriter.writeReturningUsersResults(rur,today);

    }


}