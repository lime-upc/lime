package org.lime.batch.resultDTOs;

public class RankingElement {

	private String name;
	private Integer quantity;
	private Double percentage;



	public Double getPercentage() {
		return percentage;
	}

	public void setPercentage(Double percentage) {
		this.percentage = percentage;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	@Override
	public String toString() {
		return "RankingElement{" +
				"name='" + name + '\'' +
				", quantity=" + quantity +
				'}';
	}
}
