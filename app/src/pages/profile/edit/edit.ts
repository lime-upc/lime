import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthHttp } from 'angular2-jwt';
import { AuthenticationService } from '../../../services/AuthenticationService';

type userProfile = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  preferences: string[];
}


@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html'
})
export class EditProfilePage {


  formData: userProfile;
  preferencesList: any[];
  errors: any;
  email: String;

  constructor(public navCtrl: NavController, private http: HttpClient, private authHttp: AuthHttp, private authenticationService: AuthenticationService) {


    this.email = this.authenticationService.getEmail();

    //To store the local errors
    this.errors = {
      email: undefined,
      password: undefined,
      first_name: undefined,
      last_name: undefined,
      date_of_birth: undefined,
      gender: undefined,
      preferences: undefined
    };

    //To store the input data
    this.formData = {
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      date_of_birth: "",
      gender: "",
      preferences: []
    };

    //List of preferences of food
    this.preferencesList = [
      {name: "Indian food", selected: false},
      {name: "Pizza", selected: false},
      {name: "Coffee", selected: false},
      {name: "Vegan", selected: false}
    ];

    this.loadData();


  }

  loadData(){
    this.authHttp.get('http://localhost:3000/users/' + this.email)
      .subscribe(
        res => {
          //Success!! Store token in localStorage
          var response = JSON.parse((res as any)._body);
          var userData = response.message;
          this.formData.email = userData.email;
          this.formData.first_name = userData.first_name;
          this.formData.last_name = userData.last_name;

          //TODO: Date of birth must be in format yyyy-MM-dd
          this.formData.date_of_birth = userData.date_of_birth.substr(0,10);
          this.formData.gender = userData.gender;

          //TODO: Preferences list
        },
        err => {
          //Show error
          var error = JSON.parse(err._body);
          alert("ERROR: " + error.message);
        }
      );
  }

  doUpdate(){

    //Restart errors
    var hasError = false;
    this.errors = {
      email: undefined,
      first_name: undefined,
      last_name: undefined,
      date_of_birth: undefined,
      gender: undefined,
      preferences: undefined
    };


    //Copy the form data into userData variable
    var userData =  JSON.parse(JSON.stringify(this.formData));

    //Serialize preferences to send them
    userData.preferences = [];
    for (let entry of this.preferencesList){
     if(entry.selected){
       userData.preferences.push(entry.name);
     }
   }

   //Change birthdate format to MM/DD/YYYY
    userData.date_of_birth = this.formatDate(this.formData.date_of_birth);
    console.log(this.formatDate(userData.date_of_birth));


    //Check for errors
    this.errors.email = !userData.email;
    this.errors.first_name = !userData.first_name;
    this.errors.last_name = !userData.last_name;
    this.errors.date_of_birth = !userData.date_of_birth;
    this.errors.gender = !userData.gender;
    this.errors.preferences = (userData.preferences.length == 0);

    for (let key in this.errors){
      if (this.errors[key]) {hasError = true;}
    }

    //Do not do anything if there is any error
    if(hasError){
      alert("Please, fill the form correctly");
      return;
    }

    //If no error, we submit
    this.authHttp.put('http://localhost:3000/users/' + this.email, userData)
      .subscribe(
        res => {
          alert("Updated successfully.")
        },
        err => {
          var error = JSON.parse(err.error);
          alert("ERROR: " + error.message);
        }
      );

  }



  //Formats date into MM/DD/YYY format required by API
   formatDate(inputDate) {
    var date = new Date(inputDate);
    if (!isNaN(date.getTime())){
      // Months use 0 index.
      return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
    }
  }


}
