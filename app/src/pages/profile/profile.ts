import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthHttp } from 'angular2-jwt';
import { AuthenticationService } from '../../services/AuthenticationService';
import {EditProfilePage} from "./edit/edit";
import 'rxjs/add/operator/toPromise';
type loginData = {
  email: string;
  password: string;
}


@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {


  userData: any = {};
  email: string;


  constructor(public navCtrl: NavController, private authHttp: AuthHttp, private authenticationService:AuthenticationService) {


  }


  //Important: Each time we visit the page, refresh the user data.
  ionViewDidEnter(){
    this.authenticationService.getUserData()
      .then(userData => {
        this.userData = userData;
        this.userData.date_of_birth = this.userData.date_of_birth.substring(0,10);
      })
      .catch(message => {
        alert("ERROR: " + message);
      });
  }


  goEdit(){
    this.navCtrl.push(EditProfilePage);
  }



}
