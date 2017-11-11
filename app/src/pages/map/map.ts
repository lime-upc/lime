import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../services/AuthenticationService';
import {HomePage} from "../home/home";

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {



  email: string;
  constructor(public navCtrl: NavController, private http: HttpClient, private authenticationService:AuthenticationService) {

    this.email = authenticationService.getEmail();

  }

  logOut(){
    this.authenticationService.logout();
    this.navCtrl.push(HomePage);
  }




}
