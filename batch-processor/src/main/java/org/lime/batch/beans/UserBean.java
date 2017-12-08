package org.lime.batch.beans;

import org.bson.Document;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;

public class UserBean implements Serializable {

	private String _id;
	private String email;
	private String first_name;
	private String last_name;
	private Date date_of_birth;
	private String gender;
	private Integer age;

	public UserBean(Document mongoResult){
		this._id = mongoResult.get("_id").toString();
		this.email = mongoResult.get("email").toString();
		this.first_name =  mongoResult.get("first_name").toString();
		this.last_name = mongoResult.get("last_name").toString();
		this.gender = mongoResult.get("gender").toString();
		this.date_of_birth = mongoResult.getDate("date_of_birth");

		LocalDate birth = date_of_birth.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
		this.age = Long.valueOf(ChronoUnit.YEARS.between( birth, LocalDate.now() )).intValue();
	}

	//Derivate attribute
	public Integer getAge(){
		return this.age;
	}



	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getFirst_name() {
		return first_name;
	}

	public void setFirst_name(String first_name) {
		this.first_name = first_name;
	}

	public String getLast_name() {
		return last_name;
	}

	public void setLast_name(String last_name) {
		this.last_name = last_name;
	}

	public Date getDate_of_birth() {
		return date_of_birth;
	}

	public void setDate_of_birth(Date date_of_birth) {
		this.date_of_birth = date_of_birth;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	@Override
	public String toString() {
		return "UserBean{" +
				"_id='" + _id + '\'' +
				", email='" + email + '\'' +
				", first_name='" + first_name + '\'' +
				", last_name='" + last_name + '\'' +
				", date_of_birth=" + date_of_birth +
				", gender='" + gender + '\'' +
				", age=" + age +
				'}';
	}
}
