package org.lime.batch;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.storage.StorageLevel;
import org.lime.batch.beans.TransactionBean;
import org.lime.batch.externalDataLoaders.TransactionsLoader;
import org.lime.batch.externalDataWriters.ElasticSearchWriter;
import org.lime.batch.resultDTOs.TransactionProfileResults;
import org.lime.batch.resultDTOs.TransactionRestaurantResults;

public class Main {

    
    public static void main(String[] args) throws Exception {


        SparkConf conf = new SparkConf().setAppName("Batch Processor").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);

        ctx.setLogLevel("ERROR");
        String day = "07/12/2017";

        //Get all the locations from yesterday
        //JavaRDD<LocationBean> locations = HBaseLoader.getLocationsForDayRDD(ctx,"07/12/2017");

        //Get all the confirmed transactions for yesterday as a RDD, for all the Business Owners
        JavaRDD<TransactionBean> transactions  = TransactionsLoader.getConfirmedTransactionsForDayRDD(ctx,day);

        //Persist as this RDD is used by different branches
        transactions.persist(StorageLevel.MEMORY_AND_DISK());


        //Do the processing, and obtain objects ready to save into ElasticSearch
        System.out.println("Calculating users metrics...");
        TransactionProfileResults tpResults = TransactionProfileMetrics.calculateMetrics(transactions);
        System.out.println("Calculating restaurant and tags metrics...");
        TransactionRestaurantResults trResults = TransactionRestaurantMetrics.getMetrics(transactions);

        //Save resultDTOs into elasticSearch
        System.out.println("Saving results to ElasticSearch...");
        ElasticSearchWriter.writeTransactionProfileResults(tpResults,day);
        ElasticSearchWriter.writeTransactionRestaurantResults(trResults,day);
        System.out.println("Done!");

    }


}