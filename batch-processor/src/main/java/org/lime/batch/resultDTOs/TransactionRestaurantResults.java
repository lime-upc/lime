package org.lime.batch.resultDTOs;

import java.util.List;

public class TransactionRestaurantResults {



	private List<RankingElement> restaurantRanking;
	private List<RankingElement> tagRanking;

	public List<RankingElement> getRestaurantRanking() {
		return restaurantRanking;
	}

	public void setRestaurantRanking(List<RankingElement> restaurantRanking) {
		this.restaurantRanking = restaurantRanking;
	}

	public List<RankingElement> getTagRanking() {
		return tagRanking;
	}

	public void setTagRanking(List<RankingElement> tagRanking) {
		this.tagRanking = tagRanking;
	}
}
