package org.lime.batch.beans;

import org.bson.Document;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class RestaurantBean implements Serializable{

	private String businessOwnerId;
	private String email;
	private String restaurantId;
	private List<String> tags;
	private String phoneNumber;
	private String restaurantName;
	private Double restaurantRating;
	private String restaurantAddress;
	private boolean permanentlyClosed;


	public RestaurantBean(Document mongoResult){
		this.businessOwnerId = mongoResult.get("_id").toString();
		this.email = mongoResult.getString("email");
		this.phoneNumber = mongoResult.getString("phone_number");
		Document business = (Document) mongoResult.get("business");
		this.restaurantId=business.getString("_id");
		this.restaurantName=business.getString("name").replaceAll("\"","");
		try{
			this.restaurantRating=business.getDouble("rating");
		}
		catch(ClassCastException ex){
			this.restaurantRating=(double) business.getInteger("rating");
		}
		this.restaurantAddress=business.getString("address").replaceAll("\"","");
		this.permanentlyClosed=business.getBoolean("permanently_closed");
		this.tags = (List<String>) mongoResult.get("tags");
		if(this.tags == null){
			this.tags = new ArrayList<>();
		}

	}

	public String getRestaurantId() {
		return restaurantId;
	}

	public void setRestaurantId(String restaurantId) {
		this.restaurantId = restaurantId;
	}

	public String getBusinessOwnerId() {
		return businessOwnerId;
	}

	public void setBusinessOwnerId(String businessOwnerId) {
		this.businessOwnerId = businessOwnerId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public List<String> getTags() {
		return tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getRestaurantName() {
		return restaurantName;
	}

	public void setRestaurantName(String restaurantName) {
		this.restaurantName = restaurantName;
	}

	public Double getRestaurantRating() {
		return restaurantRating;
	}

	public void setRestaurantRating(Double restaurantRating) {
		this.restaurantRating = restaurantRating;
	}

	public String getRestaurantAddress() {
		return restaurantAddress;
	}

	public void setRestaurantAddress(String restaurantAddress) {
		this.restaurantAddress = restaurantAddress;
	}

	public boolean isPermanentlyClosed() {
		return permanentlyClosed;
	}

	public void setPermanentlyClosed(boolean permanentlyClosed) {
		this.permanentlyClosed = permanentlyClosed;
	}

	@Override
	public String toString() {
		return "RestaurantBean{" +
				"businessOwnerId='" + businessOwnerId + '\'' +
				", email='" + email + '\'' +
				", restaurantId='" + restaurantId + '\'' +
				", tags=" + tags +
				", phoneNumber='" + phoneNumber + '\'' +
				", restaurantName='" + restaurantName + '\'' +
				", restaurantRating=" + restaurantRating +
				", restaurantAddress='" + restaurantAddress + '\'' +
				", permanentlyClosed=" + permanentlyClosed +
				'}';
	}
}
