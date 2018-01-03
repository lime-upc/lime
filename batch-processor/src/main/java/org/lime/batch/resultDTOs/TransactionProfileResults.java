package org.lime.batch.resultDTOs;

import org.apache.spark.api.java.JavaPairRDD;
import org.lime.batch.beans.Hour;
import scala.Tuple2;
import scala.Tuple3;

import java.util.HashMap;
import java.util.List;

public class TransactionProfileResults {

	JavaPairRDD<Tuple3<String,String,Hour>,Integer> txs_bo_gender_hour;
	JavaPairRDD<Tuple3<String,Integer,Hour>,Integer> txs_bo_age_hour;
	JavaPairRDD<Tuple2<String,Hour>,Integer> txs_bo_hour;

	JavaPairRDD<Tuple2<String,Hour>,Integer> txs_gender_hour;
	JavaPairRDD<Tuple2<Integer,Hour>,Integer> txs_age_hour;
	JavaPairRDD<Hour,Integer> txs_hour;


	public void setEmpty(){
		//Do nothing
	}
	public JavaPairRDD<Tuple3<String, String, Hour>, Integer> getTxs_bo_gender_hour() {
		return txs_bo_gender_hour;
	}

	public void setTxs_bo_gender_hour(JavaPairRDD<Tuple3<String, String, Hour>, Integer> txs_bo_gender_hour) {
		this.txs_bo_gender_hour = txs_bo_gender_hour;
	}

	public JavaPairRDD<Tuple3<String, Integer, Hour>, Integer> getTxs_bo_age_hour() {
		return txs_bo_age_hour;
	}

	public void setTxs_bo_age_hour(JavaPairRDD<Tuple3<String, Integer, Hour>, Integer> txs_bo_age_hour) {
		this.txs_bo_age_hour = txs_bo_age_hour;
	}

	public JavaPairRDD<Tuple2<String, Hour>, Integer> getTxs_bo_hour() {
		return txs_bo_hour;
	}

	public void setTxs_bo_hour(JavaPairRDD<Tuple2<String, Hour>, Integer> txs_bo_hour) {
		this.txs_bo_hour = txs_bo_hour;
	}

	public JavaPairRDD<Tuple2<String, Hour>, Integer> getTxs_gender_hour() {
		return txs_gender_hour;
	}

	public void setTxs_gender_hour(JavaPairRDD<Tuple2<String, Hour>, Integer> txs_gender_hour) {
		this.txs_gender_hour = txs_gender_hour;
	}

	public JavaPairRDD<Tuple2<Integer, Hour>, Integer> getTxs_age_hour() {
		return txs_age_hour;
	}

	public void setTxs_age_hour(JavaPairRDD<Tuple2<Integer, Hour>, Integer> txs_age_hour) {
		this.txs_age_hour = txs_age_hour;
	}

	public JavaPairRDD<Hour, Integer> getTxs_hour() {
		return txs_hour;
	}

	public void setTxs_hour(JavaPairRDD<Hour, Integer> txs_hour) {
		this.txs_hour = txs_hour;
	}
}
