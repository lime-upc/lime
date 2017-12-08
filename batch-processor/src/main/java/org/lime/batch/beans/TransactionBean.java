package org.lime.batch.beans;

import java.io.Serializable;

public class TransactionBean  implements Serializable{

	private String _id;
	private String user;
	private String business_owner;
	private long timestamp;
	private double payback_amount;
	private double total_amount;
	private double virtual_money_used;
	private String status;


	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getBusiness_owner() {
		return business_owner;
	}

	public void setBusiness_owner(String business_owner) {
		this.business_owner = business_owner;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public double getPayback_amount() {
		return payback_amount;
	}

	public void setPayback_amount(double payback_amount) {
		this.payback_amount = payback_amount;
	}

	public double getTotal_amount() {
		return total_amount;
	}

	public void setTotal_amount(double total_amount) {
		this.total_amount = total_amount;
	}

	public double getVirtual_money_used() {
		return virtual_money_used;
	}

	public void setVirtual_money_used(double virtual_money_used) {
		this.virtual_money_used = virtual_money_used;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Override
	public String toString() {
		return "TransactionBean{" +
				"_id='" + _id + '\'' +
				", user='" + user + '\'' +
				", business_owner='" + business_owner + '\'' +
				", timestamp=" + timestamp +
				", payback_amount=" + payback_amount +
				", total_amount=" + total_amount +
				", virtual_money_used=" + virtual_money_used +
				", status='" + status + '\'' +
				'}';
	}
}
