import { Component } from '@angular/core';
import {MenuController, NavController, ToastController} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import {StaticDataService} from "../../services/preferences";

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
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {


  formData: userProfile;
  preferencesList: any[];
  errors: any;

  constructor(public navCtrl: NavController, private http: HttpClient, private staticData: StaticDataService, private menu:MenuController,private toast: ToastController) {

    this.menu.enable(false);
    this.menu.swipeEnable(false);

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
    let completeList = staticData.getPreferences();
    this.preferencesList = [];
    for(let i = 0; i < completeList.length; i++){
      this.preferencesList.push({name: staticData.underscoreToText(completeList[i]), code: completeList[i], selected: false});
    }



  }





  doRegister(){

    //Restart errors
    var hasError = false;
    this.errors = {
      email: undefined,
      password: undefined,
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
       userData.preferences.push(entry.code);
     }
   }

   //Change birthdate format to MM/DD/YYYY
    userData.date_of_birth = this.formatDate(this.formData.date_of_birth);
    console.log(this.formatDate(userData.date_of_birth));


    //Check for errors
    this.errors.email = !userData.email;
    this.errors.password = !userData.password;
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
      this.toast.create(
        {message: 'Please, fill all the required fields.',
          duration: 3000,
          position: 'bottom'}
      ).present();
      return;
    }

    //If no error, we submit
    this.http.post('https://lime-backend.herokuapp.com/users/', userData)
      .subscribe(
        res => {
          this.toast.create(
             {message: 'Registered successfully. You may now log-in.',
              duration: 3000,
              position: 'bottom'}
          ).present();
          this.navCtrl.pop();

        },
        err => {
          var error = JSON.parse(err.error);
          this.toast.create(
            {message: 'Error: ' + error.message,
              duration: 3000,
              position: 'bottom'}
          ).present();
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
