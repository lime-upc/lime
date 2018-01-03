package org.lime.batch.beans;

import org.lime.batch.resultDTOs.RankingElement;

import java.util.List;

public class ReturningUserBean {

	private int uniqueUsers;
	private int uniqueReturningUsers;
	private List<RankingElement> frequencies;


	public int getUniqueUsers() {
		return uniqueUsers;
	}

	public void setUniqueUsers(int uniqueUsers) {
		this.uniqueUsers = uniqueUsers;
	}

	public int getUniqueReturningUsers() {
		return uniqueReturningUsers;
	}

	public void setUniqueReturningUsers(int uniqueReturningUsers) {
		this.uniqueReturningUsers = uniqueReturningUsers;
	}

	public List<RankingElement> getFrequencies() {
		return frequencies;
	}

	public void setFrequencies(List<RankingElement> frequencies) {
		this.frequencies = frequencies;
	}
}
