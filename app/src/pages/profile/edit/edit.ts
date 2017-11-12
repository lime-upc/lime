import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthHttp } from 'angular2-jwt';
import { AuthenticationService } from '../../../services/AuthenticationService';
import {StaticDataService} from "../../../services/preferences";
import {ProfilePage} from "../profile";

type userProfile = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
}


@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html'
})
export class EditProfilePage {


  formData: userProfile;
  preferencesList: any[];
  errors: any;

  constructor(public navCtrl: NavController,
              private http: HttpClient,
              private authHttp: AuthHttp,
              private authenticationService: AuthenticationService,
              private staticData: StaticDataService,
              private toast: ToastController) {



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
      gender: ""
    };


    //List of preferences of food, empty at beginning
    let completeList = staticData.getPreferences();
    this.preferencesList = [];
    for(let i = 0; i < completeList.length; i++){
      this.preferencesList.push({name: staticData.underscoreToText(completeList[i]), code: completeList[i], selected: false});
    }



    authenticationService.getUserData()
      .then(userData => {
        this.formData = JSON.parse(JSON.stringify(userData)); //We make a copy of the data
        this.formData.date_of_birth = this.formData.date_of_birth.substr(0,10);
        for (let preferenceCode of userData.preferences) {
          //Have to set to true in preference list
          for (let p of this.preferencesList){
            if(p.code == preferenceCode){
              p.selected = true;
              break;
            }
          }
        }

      })
      .catch(message => {
        this.toast.create(
          {message: 'Error: ' + message,
            duration: 3000,
            position: 'bottom'}
        ).present();
      });


  }

  /*loadData(){
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


          for (let preferenceCode of userData.preferences) {
            //Have to set to true in preference list
            for (let p of this.preferencesList){
              if(p.code == preferenceCode){
                p.selected = true;
                break;
              }
            }
          }

        },
        err => {
          //Show error
          var error = JSON.parse(err._body);
          alert("ERROR: " + error.message);
        }
      );
  }*/

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
    let userData =  JSON.parse(JSON.stringify(this.formData));

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
        {message: 'Please, fill all the fields',
          duration: 3000,
          position: 'bottom'}
      ).present();
      return;
    }

    //If no error, we submit
    this.authHttp.put('https://lime-backend.herokuapp.com/users/' + this.formData.email, userData)
      .subscribe(
        res => {
          console.dir(res);
          var response = JSON.parse((res as any)._body);
          this.authenticationService.updateUserData(response.message);
          this.toast.create(
            {message: 'Details updated successfully',
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
