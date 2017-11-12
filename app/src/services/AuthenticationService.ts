import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {JwtHelper} from "angular2-jwt";
import { AuthHttp } from 'angular2-jwt';


@Injectable()
export class AuthenticationService {

  token: String;
  userData: any = {};

  jwtHelper: JwtHelper = new JwtHelper();

  constructor(private storage: Storage, private authHttp: AuthHttp) {

  }



  /**
   * Public function to retrieve the user data.
   * If not logged in, throws error.
   */
  getUserData(){

    if (this.token && this.userData){ //Data already loaded
      return Promise.resolve(this.userData);
    }

    return this.loadUserData();

  }

  updateUserData(userData: any){
    this.userData = userData;
  }


  //When set new token, also retrieve new data
  setTokenAndFetchData(newToken: string){

    //Saves in local storage
    return this.storage.set('jwt',newToken)
      .then((res) => {

        //Sets value in memory
        this.token = newToken;

        //Retrieves new data
        return this.loadUserData();
      });


  }


  logout(){

    //Clears in local storage
    this.storage.set('jwt',undefined)
      .then(res => {
          this.token = undefined;
          this.userData = undefined;
      });


  }

  isAuthenticated(){
    return this.token != undefined && this.userData != undefined;
  }

  //Returns token from localstorage, or undefined if it does not exist.
  private loadToken(){
    return this.storage.get('jwt')
      .then((val) => {
        console.log("Loaded token: " + val);
        this.token = val;
        return this.token;
      });
  }





  private loadUserData(){

    return this.loadToken()
      .then(token => {


        if(!token){
          throw "User is not authenticated";
        }

        let email = this.jwtHelper.decodeToken(token as string).email;
        return this.authHttp.get('https://lime-backend.herokuapp.com/users/' + email)
          .toPromise()
          .then(res => {

            var response = JSON.parse((res as any)._body);
            var newData = response.message;

            //console.dir(newData);
            this.userData = {};
            this.userData.email = newData.email;
            this.userData.first_name = newData.first_name;
            this.userData.last_name = newData.last_name;
            this.userData.date_of_birth = newData.date_of_birth;
            this.userData.gender = newData.gender;
            this.userData.preferences = newData.preferences;
            return this.userData;
          })
          .catch(err => {
            let error = JSON.parse(err._body);
            throw error.message;
          });

        }

      )
      .catch(err => {
        throw err;
      })

  }




}
