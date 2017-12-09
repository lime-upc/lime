package org.lime.batch.resultDTOs;

import java.util.HashMap;
import java.util.List;

public class TransactionProfileResults {

	HashMap<String,List<RankingElement>> txBoHour;
	HashMap<String,List<RankingElement>> txBoAge;
	HashMap<String,List<RankingElement>> txBoGender;
	List<RankingElement> txHour;
	List<RankingElement> txAge;
	List<RankingElement> txGender;

	public List<RankingElement> getTxHour() {
		return txHour;
	}

	public void setTxHour(List<RankingElement> txHour) {
		this.txHour = txHour;
	}

	public List<RankingElement> getTxAge() {
		return txAge;
	}

	public void setTxAge(List<RankingElement> txAge) {
		this.txAge = txAge;
	}

	public List<RankingElement> getTxGender() {
		return txGender;
	}

	public void setTxGender(List<RankingElement> txGender) {
		this.txGender = txGender;
	}

	public HashMap<String, List<RankingElement>> getTxBoHour() {
		return txBoHour;
	}

	public void setTxBoHour(HashMap<String, List<RankingElement>> txBoHour) {
		this.txBoHour = txBoHour;
	}

	public HashMap<String, List<RankingElement>> getTxBoAge() {
		return txBoAge;
	}

	public void setTxBoAge(HashMap<String, List<RankingElement>> txBoAge) {
		this.txBoAge = txBoAge;
	}

	public HashMap<String, List<RankingElement>> getTxBoGender() {
		return txBoGender;
	}

	public void setTxBoGender(HashMap<String, List<RankingElement>> txBoGender) {
		this.txBoGender = txBoGender;
	}
}
