import { Component } from '@angular/core';
import {MenuController, NavController} from 'ionic-angular';
import { AuthenticationService } from '../../services/AuthenticationService';
import {MapPage} from "../map/map";
import {HomePage} from "../home/home";
import { StatusBar } from '@ionic-native/status-bar';

@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html'
})
export class LoadingPage {

  constructor(public navCtrl: NavController, private authService: AuthenticationService, private menu: MenuController,private statusBar: StatusBar) {

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


// set status bar to white
    this.statusBar.backgroundColorByHexString('#fbc602');



    //this.authService.getToken(); //Just to load in memory

  }



}
