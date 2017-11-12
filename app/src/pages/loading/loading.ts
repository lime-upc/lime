import { Component } from '@angular/core';
import {MenuController, NavController} from 'ionic-angular';
import { AuthenticationService } from '../../services/AuthenticationService';
import {MapPage} from "../map/map";
import {HomePage} from "../home/home";

@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html'
})
export class LoadingPage {

  constructor(public navCtrl: NavController, private authService: AuthenticationService, private menu: MenuController) {

    this.menu.enable(false);
    this.menu.swipeEnable(false);

    authService.getUserData()
      .then(userData => { //If there is user info, go to MapPage
        this.navCtrl.setRoot(MapPage);
      })
      .catch(message => { //If there is any error either retrieving token or user data, go to login
        console.log("I catched");
        this.navCtrl.setRoot(HomePage);
      });



    //this.authService.getToken(); //Just to load in memory

  }



}
