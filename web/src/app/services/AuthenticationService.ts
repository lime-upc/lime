import { Injectable } from '@angular/core';
import { JwtHelper, AuthHttp } from "angular2-jwt";


@Injectable()
export class AuthenticationService {

  token: String;
  businessOwnerData: any = {};

  jwtHelper: JwtHelper = new JwtHelper();

  constructor(private storage: Storage, private authHttp: AuthHttp) {

  }

  /**
   * Public function to retrieve the businessOwner data.
   * If not logged in, throws error.
   */
  getBusinessOwnerData(){

    if (this.token && this.businessOwnerData){ //Data already loaded
      return Promise.resolve(this.businessOwnerData);
    }

    return this.loadBusinessOwnerData();

  }

  updateBusinessOwnerData(businessOwnerData: any){
    this.businessOwnerData = businessOwnerData;
  }

  //When set new token, also retrieve new data
  setTokenAndFetchData(newToken: string){

    //Saves in local storage
    return this.storage.set('jwt',newToken)
      .then((res) => {

        //Sets value in memory
        this.token = newToken;

        //Retrieves new data
        return this.loadBusinessOwnerData();
      });
  }

  logout(){

    //Clears in local storage
    this.storage.set('jwt',undefined)
      .then(res => {
          this.token = undefined;
          this.businessOwnerData = undefined;
      });
  }

  isAuthenticated(){
    return this.token != undefined && this.businessOwnerData != undefined;
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

  private loadBusinessOwnerData(){

    return this.loadToken()
      .then(token => {
        
        if(!token){
          throw "Business owner is not authenticated";
        }

        let email = this.jwtHelper.decodeToken(token as string).email;
        return this.authHttp.get('http://localhost:3000/businesses/businessData' + email)
          .toPromise()
          .then(res => {

            var response = JSON.parse((res as any)._body);
            var newData = response.message;

            this.businessOwnerData = {};
            this.businessOwnerData.email = newData.email;
            return this.businessOwnerData;
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
