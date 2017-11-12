import { Component } from '@angular/core';
import {MenuController, NavController} from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { LoginPage } from '../login/login';
import { AuthenticationService } from '../../services/AuthenticationService';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private authService: AuthenticationService, private menu: MenuController) {

    this.menu.enable(false);
    this.menu.swipeEnable(false);

    this.authService.getToken(); //Just to load in memory

  }

  goRegister(event,item){
    this.navCtrl.push(RegisterPage,{
      item: item
    });
  }

  goLogin(event,item){
    this.navCtrl.push(LoginPage,{
      item: item
    });
  }

}
