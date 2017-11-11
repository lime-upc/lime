import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {JwtHelper} from "angular2-jwt";
import { AuthHttp } from 'angular2-jwt';


@Injectable()
export class AuthenticationService {

  token: String;

  jwtHelper: JwtHelper = new JwtHelper();

  constructor(private storage: Storage, private authHttp: AuthHttp) {
    //At beginning, load token from memory
    this.storage.get('jwt')
      .then((val) => {
          console.log("Loaded token: " + val);
          this.token = val;
      });

  }



  setToken(newToken: string){

    //Saves in local storage
    this.storage.set('jwt',newToken);

    //Sets value in memory
    this.token = newToken;
  }

  logout(){

    //Clears in local storage
    this.storage.set('jwt',undefined);

    //Clears in memory
    this.token = undefined;
  }

  getToken(){
    return this.token;
  }

  getEmail(){
    if(!this.token){
      return undefined;
    }
    return this.jwtHelper.decodeToken(this.token as string).email;
  }

  isAuthenticated(){
    return this.token != undefined;
  }

}
