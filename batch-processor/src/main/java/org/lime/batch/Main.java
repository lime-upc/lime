package org.lime.batch;

import com.caffinc.sparktools.mongordd.MongoRDD;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.bson.Document;
import scala.Tuple2;
import scala.reflect.ClassManifestFactory$;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Main {


    public static void main(String[] args) throws Exception {

        SparkConf conf = new SparkConf().setAppName("Batch Processor").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);


        //Get all the locations from yesterday
        JavaRDD<LocationBean> locations = HBaseLoader.getLocationsForDayRDD(ctx,"06/12/2017");

        //Get all the confirmed transactions for yesterday as a RDD
        JavaRDD<TransactionBean> transactions  = TransactionsLoader.getConfirmedTransactionsForDayRDD(ctx,"06/12/2017");


        for(TransactionBean o: transactions.take(10)){
            System.out.println(o.getTotal_amount());
        }





    /*    //Specify start (inclusive) and end (exclusive) dates to get data from HBase
        DateDTO start = new DateDTO(2017,11,30,11,00,00);
        DateDTO end = new DateDTO(2017,11,30,11,32,00);

        //Get all the location tuples
        JavaRDD<LocationBean> locationRDD = HBaseLoader.getLocationsInRangeRDD(ctx,start,end);

        //Group by cell, so for each tuple we have now a pair <cell,1>
        JavaPairRDD<String,Integer> inGrids = locationRDD.mapToPair(locationBean ->
            new Tuple2<String, Integer>(locationBean.getCell(),1)
        );

        //Reduce so we have the count of people on each cell
        JavaPairRDD<String,Integer> reduced = inGrids.reduceByKey((a,b) -> a+b);

        JavaPairRDD<Integer,String> swapped = reduced.mapToPair(pair -> pair.swap());

        JavaPairRDD<Integer,String> sorted = swapped.sortByKey(false);


        for(Tuple2<Integer,String> cell: sorted.take(5)){
            System.out.println(cell);
        }*/



       /* //Print the retrieved data
        reduced.foreach(cellCount -> {
            System.out.println(cellCount);
        });*/

    }
}