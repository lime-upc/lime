package org.lime.batch.resultDTOs;

import java.util.HashMap;
import java.util.List;

public class ReturningUsersResults {

	HashMap<String,List<RankingElement>> boFrequencies;
	HashMap<String,Integer> boUniqueUsers;
	HashMap<String,Integer> boReturningUsers;

	public HashMap<String, List<RankingElement>> getBoFrequencies() {
		return boFrequencies;
	}

	public void setEmpty(){
		boFrequencies.clear();
		boUniqueUsers.clear();
		boReturningUsers.clear();
	}

	public void setBoFrequencies(HashMap<String, List<RankingElement>> boFrequencies) {
		this.boFrequencies = boFrequencies;
	}

	public HashMap<String, Integer> getBoUniqueUsers() {
		return boUniqueUsers;
	}

	public void setBoUniqueUsers(HashMap<String, Integer> boUniqueUsers) {
		this.boUniqueUsers = boUniqueUsers;
	}

	public HashMap<String, Integer> getBoReturningUsers() {
		return boReturningUsers;
	}

	public void setBoReturningUsers(HashMap<String, Integer> boReturningUsers) {
		this.boReturningUsers = boReturningUsers;
	}
}
