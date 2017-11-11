import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthHttp } from 'angular2-jwt';
import { MapPage } from '../map/map';
import { AuthenticationService } from '../../services/AuthenticationService';

type loginData = {
  email: string;
  password: string;
}


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {


  formData: loginData;
  errors: any;

  constructor(public navCtrl: NavController, private authHttp: AuthHttp, private authenticationService:AuthenticationService) {

    //To store the local errors
    this.errors = {
      email: undefined,
      password: undefined
    };

    //To store the input data
    this.formData = {
      email: "",
      password: ""
    };


  }

  doRegister(){

    //Restart errors
    var hasError = false;
    this.errors = {
      email: undefined,
      password: undefined

    };


    //Copy the form data into loginData variable
    var loginData =  JSON.parse(JSON.stringify(this.formData));


    //Check for errors
    this.errors.email = !loginData.email;
    this.errors.password = !loginData.password;


    for (let key in this.errors){
      if (this.errors[key]) {hasError = true;}
    }

    //Do not do anything if there is any error
    if(hasError){
      alert("Please, fill your details");
      return;
    }

    //If no error, we submit
    this.authHttp.post('http://localhost:3000/users/login', loginData)
      .subscribe(
        res => {
          //Success!! Store token in localStorage
          var response = JSON.parse((res as any)._body);
          this.authenticationService.setToken(response.message);
          this.goMap();
        },
        err => {
          //Show error
          var error = JSON.parse(err._body);
          alert("ERROR: " + error.message);
        }
      );

  }

  goMap(){
    this.navCtrl.push(MapPage);
  }




}
