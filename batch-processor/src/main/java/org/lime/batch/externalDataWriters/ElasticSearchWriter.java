package org.lime.batch.externalDataWriters;

import com.google.gson.Gson;
import org.apache.spark.api.java.JavaPairRDD;
import org.elasticsearch.action.admin.indices.mapping.put.PutMappingResponse;
import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.lime.batch.beans.Hour;
import org.lime.batch.beans.ReturningUserBean;
import org.lime.batch.resultDTOs.NewResults;
import org.lime.batch.resultDTOs.ReturningUsersResults;
import org.lime.batch.resultDTOs.TransactionProfileResults;
import org.lime.batch.resultDTOs.TransactionRestaurantResults;
import scala.Tuple2;
import scala.Tuple3;

import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import static org.elasticsearch.common.xcontent.XContentFactory.jsonBuilder;

public class ElasticSearchWriter {

	private static Gson gson = new Gson();


	public static void createIndexWithMap(TransportClient client, String index) throws IOException{

		XContentBuilder mapping = jsonBuilder()
				.startObject()
				.startObject("result")
				.startObject("properties")
				.startObject("week")
				.field("type", "keyword")
				.endObject()
				.startObject("month")
				.field("type", "keyword")
				.endObject()
				.startObject("hour")
				.field("type", "keyword")
				.endObject()
				.startObject("year")
				.field("type", "keyword")
				.endObject()
				.startObject("day")
				.field("type", "keyword")
				.endObject()
				.startObject("gender")
				.field("type", "keyword")
				.endObject()
				.endObject()
				.endObject()
				.endObject();

		client.admin().indices().prepareCreate(index).get();
		PutMappingResponse putMappingResponse = client.admin().indices()
				.preparePutMapping(index)
				.setType("result")
				.setSource(mapping)
				.execute().actionGet();
	}

	public static void writeNewResults(NewResults newResults) throws Exception{

		TransportClient client = new PreBuiltTransportClient(Settings.EMPTY)
				.addTransportAddress(new TransportAddress(InetAddress.getByName("192.168.56.20"), 9300));


		createIndexWithMap(client,"txs_bo_age_hour");
		createIndexWithMap(client,"txs_bo_gender_hour");
		createIndexWithMap(client,"txs_bo_hour");
		createIndexWithMap(client,"txs_age");
		createIndexWithMap(client,"txs_gender");
		createIndexWithMap(client,"txs_hour");


		//Write txs per hour
		JavaPairRDD<Hour,Integer> txs_hour = newResults.getTxs_hour();
		BulkRequestBuilder bulkRequest = client.prepareBulk();

		for(Tuple2<Hour,Integer> t: txs_hour.collect()) {


			Map<String, Object> object = new HashMap<>();
			object.put("timestamp",t._1.getTimestamp());
			object.put("year",t._1.getYear());
			object.put("month",t._1.getMonth());
			object.put("week",t._1.getWeek());
			object.put("day",t._1.getDay());
			object.put("hour",t._1.getHour());
			object.put("count",t._2);

			String key = t._1.toString();
			bulkRequest.add(client.prepareIndex("txs_hour","result",key).setSource(object));

			//IndexRequest indexRequest = new IndexRequest("txs_hour","result",key);
			//indexRequest.source(object);
			//client.index(indexRequest).actionGet();

		}
		bulkRequest.execute().actionGet();

		//Write txs per age and hour
		JavaPairRDD<Tuple2<Integer,Hour>,Integer> txs_age = newResults.getTxs_age_hour();
		bulkRequest = client.prepareBulk();
		for(Tuple2<Tuple2<Integer,Hour>,Integer> t: txs_age.collect()) {

			Map<String, Object> object = new HashMap<>();
			object.put("timestamp",t._1._2.getTimestamp());
			object.put("year",t._1._2.getYear());
			object.put("month",t._1._2.getMonth());
			object.put("week",t._1._2.getWeek());
			object.put("day",t._1._2.getDay());
			object.put("hour",t._1._2.getHour());
			object.put("age",t._1._1);
			object.put("count",t._2);

			String key = t._1._1() + "_" + t._1._2.toString();
			bulkRequest.add(client.prepareIndex("txs_age","result",key).setSource(object));


		}
		bulkRequest.execute().actionGet();


		//Write txs per gender and hour
		JavaPairRDD<Tuple2<String,Hour>,Integer> txs_gender = newResults.getTxs_gender_hour();
		bulkRequest = client.prepareBulk();

		for(Tuple2<Tuple2<String,Hour>,Integer> t: txs_gender.collect()) {

			Map<String, Object> object = new HashMap<>();
			object.put("timestamp",t._1._2.getTimestamp());
			object.put("year",t._1._2.getYear());
			object.put("month",t._1._2.getMonth());
			object.put("week",t._1._2.getWeek());
			object.put("day",t._1._2.getDay());
			object.put("hour",t._1._2.getHour());
			object.put("gender",t._1._1);
			object.put("count",t._2);

			String key = t._1._1() + "_" + t._1._2.toString();
			bulkRequest.add(client.prepareIndex("txs_gender","result",key).setSource(object));

		}
		bulkRequest.execute().actionGet();



		//Write txs per bo and hour
		JavaPairRDD<Tuple2<String,Hour>,Integer> txs_bo_hour = newResults.getTxs_bo_hour();
		bulkRequest = client.prepareBulk();

		for(Tuple2<Tuple2<String,Hour>,Integer> t:  txs_bo_hour.collect()) {

			Map<String, Object> object = new HashMap<>();
			object.put("bo",t._1()._1());
			object.put("timestamp",t._1._2.getTimestamp());
			object.put("year",t._1._2.getYear());
			object.put("month",t._1._2.getMonth());
			object.put("week",t._1._2.getWeek());
			object.put("day",t._1._2.getDay());
			object.put("hour",t._1._2.getHour());
			object.put("count",t._2);

			String key = t._1()._1() + "_" + t._1._2();
			bulkRequest.add(client.prepareIndex("txs_bo_hour","result",key).setSource(object));

		}
		bulkRequest.execute().actionGet();

		//Write txs per bo, age and hour
		JavaPairRDD<Tuple3<String,Integer,Hour>,Integer> txs_bo_age_hour = newResults.getTxs_bo_age_hour();
		bulkRequest = client.prepareBulk();

		for(Tuple2<Tuple3<String,Integer,Hour>,Integer> t: txs_bo_age_hour.collect()) {

			Map<String, Object> object = new HashMap<>();
			object.put("bo",t._1()._1());
			object.put("timestamp",t._1._3().getTimestamp());
			object.put("year",t._1._3().getYear());
			object.put("month",t._1._3().getMonth());
			object.put("week",t._1._3().getWeek());
			object.put("day",t._1._3().getDay());
			object.put("hour",t._1._3().getHour());
			object.put("age",t._1._2());
			object.put("count",t._2);

			String key = t._1()._1() + "_" + t._1._2() + "_" + t._1._3().toString();
			bulkRequest.add(client.prepareIndex("txs_bo_age_hour","result",key).setSource(object));


		}

		bulkRequest.execute().actionGet();

		//Write txs per bo, age and hour
		JavaPairRDD<Tuple3<String,String,Hour>,Integer> txs_bo_gender_hour = newResults.getTxs_bo_gender_hour();
		bulkRequest = client.prepareBulk();

		for(Tuple2<Tuple3<String,String,Hour>,Integer> t: txs_bo_gender_hour.collect()) {

			Map<String, Object> object = new HashMap<>();
			object.put("bo",t._1()._1());
			object.put("timestamp",t._1._3().getTimestamp());
			object.put("year",t._1._3().getYear());
			object.put("month",t._1._3().getMonth());
			object.put("week",t._1._3().getWeek());
			object.put("day",t._1._3().getDay());
			object.put("hour",t._1._3().getHour());
			object.put("gender",t._1._2());
			object.put("count",t._2);

			String key = t._1()._1() + "_" + t._1._2() + "_" + t._1._3().toString();
			bulkRequest.add(client.prepareIndex("txs_bo_gender_hour","result",key).setSource(object));


		}
		bulkRequest.execute().actionGet();



	}


	public static void writeReturningUsersResults(ReturningUsersResults ruResults, String day) throws Exception {

		//Connect to ElasticSearch
		TransportClient client = new PreBuiltTransportClient(Settings.EMPTY)
				.addTransportAddress(new TransportAddress(InetAddress.getByName("192.168.56.20"), 9300));

		Iterator it = ruResults.getBoUniqueUsers().entrySet().iterator();
		while (it.hasNext()){

			ReturningUserBean bean = new ReturningUserBean();

			Map.Entry pair = (Map.Entry)it.next();
			String bo = pair.getKey().toString();
			Integer uniqueUsers = (Integer) pair.getValue();

			bean.setUniqueUsers(uniqueUsers);
			bean.setUniqueReturningUsers(ruResults.getBoReturningUsers().getOrDefault(bo,0));
			bean.setFrequencies(ruResults.getBoFrequencies().getOrDefault(bo,new ArrayList<>()));

			String key =  bo;
			insertJsonIntoES(client,"returning_users","result",key,bean);
			it.remove();


		}

	}

	public static void writeTransactionProfileResults(TransactionProfileResults tpResults, String day) throws Exception{

		TransportClient client = new PreBuiltTransportClient(Settings.EMPTY)
				.addTransportAddress(new TransportAddress(InetAddress.getByName("192.168.56.20"), 9300));


		//SAVE INTO ELASTIC-SEARCH THE PRE-COMPUTED JSON RESULTS FOR FRONTEND

		//Transactions per BO and AGE. For each BO, one entry
		Iterator it = tpResults.getTxBoAge().entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry)it.next();
			insertJsonIntoES(client,"age_bo_txs","result",day + "_" + pair.getKey(),pair.getValue());
			it.remove(); // avoids a ConcurrentModificationException
		}

		//Transactions per BO and Hour. For each BO, one entry
		it = tpResults.getTxBoHour().entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry)it.next();
			insertJsonIntoES(client,"hour_bo_txs","result",day + "_" + pair.getKey(),pair.getValue());
			it.remove(); // avoids a ConcurrentModificationException
		}

		//Transactions per BO and Gender. For each BO, one entry
		it = tpResults.getTxBoGender().entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry)it.next();
			insertJsonIntoES(client,"gender_bo_txs","result",day + "_" + pair.getKey(),pair.getValue());
			it.remove(); // avoids a ConcurrentModificationException
		}

		//People by frequency and BO. For each BO, one entry
		it = tpResults.getPeopleBoFreq().entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry)it.next();
			insertJsonIntoES(client,"people_bo_freq","result",day + "_" + pair.getKey(),pair.getValue());
			it.remove(); // avoids a ConcurrentModificationException
		}

		it = tpResults.getUniqueUsersByBo().entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry)it.next();
			insertJsonIntoES(client,"bo_unique_users","result",day + "_" + pair.getKey(),pair.getValue());
			it.remove(); // avoids a ConcurrentModificationException
		}

		it = tpResults.getReturningUsersByBo().entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry)it.next();
			insertJsonIntoES(client,"bo_returning_users","result",day + "_" + pair.getKey(),pair.getValue());
			it.remove(); // avoids a ConcurrentModificationException
		}


		//Save aggregated transactiosn per gender, age and hour, for all the businesses
		insertJsonIntoES(client,"gender_txs","result",day,tpResults.getTxGender());
		insertJsonIntoES(client,"age_txs","result",day,tpResults.getTxAge());
		insertJsonIntoES(client,"hour_txs","result",day,tpResults.getTxHour());

	}

	public static void writeTransactionRestaurantResults(TransactionRestaurantResults trResults, String day) throws Exception{

		TransportClient client = new PreBuiltTransportClient(Settings.EMPTY)
				.addTransportAddress(new TransportAddress(InetAddress.getByName("192.168.56.20"), 9300));

		//Save restaurant and category rankings
		insertJsonIntoES(client,"rankings","result","tags",trResults.getTagRanking());
		insertJsonIntoES(client,"rankings","result","restaurants",trResults.getRestaurantRanking());

	}

	private static void insertJsonIntoES(TransportClient client, String index, String type, String key, Object object){
		Map<String, Object> json = new HashMap<>();
		json.put("json",gson.toJson(object));

		IndexRequest indexRequest = new IndexRequest(index,type,key);
		indexRequest.source(json);
		client.index(indexRequest).actionGet();

	}
}
