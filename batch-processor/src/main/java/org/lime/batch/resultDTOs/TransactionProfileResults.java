package org.lime.batch.resultDTOs;

import java.util.HashMap;
import java.util.List;

public class TransactionProfileResults {

	HashMap<String,List<RankingElement>> txBoHour;
	HashMap<String,List<RankingElement>> txBoAge;
	HashMap<String,List<RankingElement>> txBoGender;
	HashMap<String,List<RankingElement>> peopleBoFreq;


	List<RankingElement> txHour;
	List<RankingElement> txAge;
	List<RankingElement> txGender;

	HashMap<String,Integer> uniqueUsersByBo;
	HashMap<String,Integer> returningUsersByBo;

	public HashMap<String, Integer> getUniqueUsersByBo() {
		return uniqueUsersByBo;
	}

	public void setUniqueUsersByBo(HashMap<String, Integer> uniqueUsersByBo) {
		this.uniqueUsersByBo = uniqueUsersByBo;
	}

	public HashMap<String, Integer> getReturningUsersByBo() {
		return returningUsersByBo;
	}

	public void setReturningUsersByBo(HashMap<String, Integer> returningUsersByBo) {
		this.returningUsersByBo = returningUsersByBo;
	}

	public HashMap<String, List<RankingElement>> getPeopleBoFreq() {
		return peopleBoFreq;
	}

	public void setPeopleBoFreq(HashMap<String, List<RankingElement>> peopleBoFreq) {
		this.peopleBoFreq = peopleBoFreq;
	}

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
