package org.lime.batch.externalDataWriters;

import com.google.gson.Gson;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.lime.batch.resultDTOs.TransactionProfileResults;
import org.lime.batch.resultDTOs.TransactionRestaurantResults;

import java.net.InetAddress;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class ElasticSearchWriter {

	private static Gson gson = new Gson();

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


		//Save aggregated transactiosn per gender, age and hour, for all the businesses
		insertJsonIntoES(client,"gender_txs","result",day,tpResults.getTxGender());
		insertJsonIntoES(client,"age_txs","result",day,tpResults.getTxAge());
		insertJsonIntoES(client,"hour_txs","result",day,tpResults.getTxHour());

	}

	public static void writeTransactionRestaurantResults(TransactionRestaurantResults trResults, String day) throws Exception{

		TransportClient client = new PreBuiltTransportClient(Settings.EMPTY)
				.addTransportAddress(new TransportAddress(InetAddress.getByName("192.168.56.20"), 9300));

		//Save restaurant and category rankings
		insertJsonIntoES(client,"tag_ranking","result",day,trResults.getTagRanking());
		insertJsonIntoES(client,"restaurant_ranking","result",day,trResults.getRestaurantRanking());

	}

	private static void insertJsonIntoES(TransportClient client, String index, String type, String key, Object object){
		Map<String, Object> json = new HashMap<>();
		json.put("json",gson.toJson(object));

		IndexRequest indexRequest = new IndexRequest(index,type,key);
		indexRequest.source(json);
		client.index(indexRequest).actionGet();

	}
}
