import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthHttp } from 'angular2-jwt';
import { MapPage } from '../map/map';
import { AuthenticationService } from '../../services/AuthenticationService';
import { MenuController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

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

  constructor(public navCtrl: NavController,
              private authHttp: AuthHttp,
              private authenticationService:AuthenticationService,
              private menu: MenuController,
              private toast: ToastController) {

    this.menu.enable(false);
    this.menu.swipeEnable(false);

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
    this.authHttp.post('https://lime-backend.herokuapp.com/users/login', loginData)
      .subscribe(
        res => {
          //Success!! Store token in localStorage
          var response = JSON.parse((res as any)._body);
          this.authenticationService.setTokenAndFetchData(response.message)
            .then(res => {
              this.toast.create(
                {message: 'Welcome back ' + res.first_name,
                  duration: 3000,
                  position: 'bottom'}).present();
              this.goMap();
            });

        },
        err => {
          //Show error
          var error = JSON.parse(err._body);
          this.toast.create(
            {message: 'Error: ' + error.message,
              duration: 3000,
              position: 'bottom'}).present();


        }
      );

  }

  goMap(){
    this.navCtrl.setRoot(MapPage);
  }




}
