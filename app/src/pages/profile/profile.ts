import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthHttp } from 'angular2-jwt';
import { AuthenticationService } from '../../services/AuthenticationService';
import {EditProfilePage} from "./edit/edit";

type loginData = {
  email: string;
  password: string;
}


@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {


  userData: any;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;

  constructor(public navCtrl: NavController, private authHttp: AuthHttp, private authenticationService:AuthenticationService) {

    this.email = authenticationService.getEmail();


    this.loadData();
  }


  goEdit(){
    this.navCtrl.push(EditProfilePage);
  }

  loadData(){

    this.authHttp.get('http://localhost:3000/users/' + this.email)
      .subscribe(
        res => {
          //Success!! Store token in localStorage
          var response = JSON.parse((res as any)._body);
          this.userData = response.message;
          this.first_name = this.userData.first_name;
          this.last_name = this.userData.last_name;
          this.date_of_birth = this.userData.date_of_birth;
          this.gender = this.userData.gender;

        },
        err => {
          //Show error
          var error = JSON.parse(err._body);
          alert("ERROR: " + error.message);
        }
      );

  }

}
