package org.lime.batch;

/**
 * This class allows to abstract the date management.s
 */
public class DateDTO {

	private String year;
	private String month;
	private String day;
	private String hour;
	private String minute;
	private String second;

	public DateDTO(int year, int month, int day, int hour, int minute, int second) {
		this.year = String.valueOf(year);
		this.month = String.format("%02d", month-1);
		this.day = String.format("%02d", day);
		this.hour = String.format("%02d", hour);
		this.minute = String.format("%02d", minute);
		this.second = String.format("%02d", second);

	}

	public String getYear() {
		return year;
	}

	public String getMonth() {
		return month;
	}

	public String getDay() {
		return day;
	}

	public String getHour() {
		return hour;
	}

	public String getMinute() {
		return minute;
	}

	public String getSecond() {
		return second;
	}

	public String getFullDate(){
		return year + month + day + hour + minute + second;
	}
}
