package org.lime.batch.beans;

import java.io.Serializable;
import java.util.Calendar;
import java.util.Date;

public class Hour implements Serializable{

	private int year;
	private int month;
	private int day;
	private int hour;
	private int week;
	private long timestamp;

	public long getTimestamp(){
		return this.timestamp;
	}

	public Hour(long timestamp){
		Date time=new java.util.Date(timestamp);
		Calendar cal = Calendar.getInstance();
		cal.setTime(time);
		this.year = cal.get(Calendar.YEAR);
		this.month = cal.get(Calendar.MONTH) + 1; //Java starts with 0;
		this.day = cal.get(Calendar.DAY_OF_MONTH);
		this.hour = cal.get(Calendar.HOUR_OF_DAY);
		this.week = cal.get(Calendar.WEEK_OF_YEAR);
		this.timestamp = timestamp;
	}

	public String getWeek() {
		return  year + " week " + week;
	}

	public void setWeek(int week) {
		this.week = week;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public String getYear() {
		return String.valueOf(year);
	}

	public void setYear(int year) {
		this.year = year;
	}

	public String getMonth() {
		return year + "-" + String.format("%02d", month);
	}

	public void setMonth(int month) {
		this.month = month;
	}

	public String getDay() {
		return year + "-" + String.format("%02d", month) + "-" + String.format("%02d", day);
	}

	public void setDay(int day) {
		this.day = day;
	}

	public int getHour() {
		return hour;
		//return year + "-" + String.format("%02d", month) + "-" + String.format("%02d", day) + " " + String.format("%02d", hour) + "h";
	}


	public void setHour(int hour) {
		this.hour = hour;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;

		Hour hour1 = (Hour) o;

		if (year != hour1.year) return false;
		if (month != hour1.month) return false;
		if (day != hour1.day) return false;
		return hour == hour1.hour;
	}

	@Override
	public int hashCode() {
		int result = year;
		result = 31 * result + month;
		result = 31 * result + day;
		result = 31 * result + hour;
		return result;
	}

	@Override
	public String toString() {
		return "" + year + "/" + month + "/" + day + "_" + hour + "h";
	}
}
