package org.lime.batch.beans;

/**
 * This class represents a tuple value from HBase.
 */
public class LocationBean {


	private String email;
	private long timestamp;
	private double lat;
	private double lon;
	private int year;
	private int month;
	private int day;
	private int hour;
	private int minute;
	private int second;
	private String cell;


	@Override
	public String toString(){
		return "[" + email + "] " + " (" + lat + "," + lon + ", " + cell + " ) at " + timestamp + " " + year + "/" + month + "/" + day
				+ "_" + hour + ":" + minute + ":" + second;
	}

	public String getCell() {
		return cell;
	}

	public void setCell(String cell) {
		this.cell = cell;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public double getLat() {
		return lat;
	}

	public void setLat(double lat) {
		this.lat = lat;
	}

	public double getLon() {
		return lon;
	}

	public void setLon(double lon) {
		this.lon = lon;
	}

	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	public int getMonth() {
		return month;
	}

	public void setMonth(int month) {
		this.month = month;
	}

	public int getDay() {
		return day;
	}

	public void setDay(int day) {
		this.day = day;
	}

	public int getHour() {
		return hour;
	}

	public void setHour(int hour) {
		this.hour = hour;
	}

	public int getMinute() {
		return minute;
	}

	public void setMinute(int minute) {
		this.minute = minute;
	}

	public int getSecond() {
		return second;
	}

	public void setSecond(int second) {
		this.second = second;
	}
}

