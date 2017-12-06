package org.lime.batch;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import scala.Tuple2;

public class Main {


    public static void main(String[] args) throws Exception {

        SparkConf conf = new SparkConf().setAppName("Batch Processor").setMaster("local[*]");
        JavaSparkContext ctx = new JavaSparkContext(conf);


        //Specify start (inclusive) and end (exclusive) dates to get data from HBase
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
        }

       /* //Print the retrieved data
        reduced.foreach(cellCount -> {
            System.out.println(cellCount);
        });*/

    }
}