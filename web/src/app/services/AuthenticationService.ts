import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { JwtHelper } from 'angular2-jwt';
import { AuthHttp } from 'angular2-jwt';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map'


@Injectable()
export class AuthenticationService {

  public token: string = null;
  jwtHelper: JwtHelper = new JwtHelper();
  businessData: any = null;
  realTimeMapData: any = null;

  constructor(private http: Http, private router: Router,private authHttp: AuthHttp) {
      // set token if saved in local storage
      var currentToken = this.loadToken();
      console.log("Got token: " + currentToken);
  }

  /**
   * Returns if the user is authentificated or not
   */
  isAuthentificated() {
    return this.loadToken()!=null;
  }

  loadToken(){
    return localStorage.getItem("jwt");
  }

  /**
   * Logs the business owner in
   */
  login(email: string, password: string): Observable<boolean> {
    return this.http.post('http://localhost:3000/businesses/login', { email: email, password: password })
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let token = JSON.parse((response as any)._body).message;
        if (token) {
          localStorage.setItem('jwt',token);
          // return true to indicate successful login
          return true;
        } else {
          // return false to indicate failed login
          return false;
        }
      });
  }

  /**
   * Logs the business owner out
   */
  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    this.businessData = null;
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }

  /**
   * Returns a promise with business data
   */
  getBusinessData(){
    if(this.loadToken() && this.businessData){
      return Promise.resolve(this.businessData);
    }
    return this.loadBusinessData();
  }

  private loadBusinessData(){
    var token = this.loadToken();
    if(!token){
      return Promise.reject("User is not authenticated");
    }

    let email = this.jwtHelper.decodeToken(token as string).email;
    return this.authHttp.get("http://localhost:3000/businesses/" + email)
      .toPromise()
      .then(res => {

        var response = JSON.parse((res as any)._body);
        var newData = response.message;

        this.businessData = {};
        this.businessData.email = newData.email;
        this.businessData.person_in_charge_name = newData.person_in_charge_name;
        this.businessData.phone_number = newData.phone_number;
        this.businessData.additional_info = newData.additional_info;
        this.businessData.business = newData.business;
        this.businessData.automatic_notifications = newData.automatic_notifications;
        return this.businessData;
      })
      .catch(err => {
        let error = JSON.parse(err._body);
        throw error.message;
      });

  }

  /**
   * Get the real-time map analytics
   */
  getRealTimeMapByAllUser() {
    var token = this.loadToken()
    if(!token){
      return Promise.reject("User is not authenticated");
    }
    return this.http.get("http://localhost:3000/real-time/").toPromise()
      .then(res => {
        var response = JSON.parse((res as any)._body);
        var newRealTimeMapData = response.message;
        this.realTimeMapData = newRealTimeMapData;
        //console.log(this.realTimeMapData)
        return this.realTimeMapData
      })
      .catch(err => {
        let error =  JSON.parse(err._body);
        throw error.message;
      })
  }

  getRealTimeMapByGender(gender) {
    var token = this.loadToken()
    if(!token){
      return Promise.reject("User is not authenticated");
    }
    return this.http.get("http://localhost:3000/real-time/gender/"+gender+"/").toPromise()
      .then(res => {
        var response = JSON.parse((res as any)._body);
        var newRealTimeMapData = response.message;
        this.realTimeMapData = newRealTimeMapData;
        console.log(this.realTimeMapData)
        return this.realTimeMapData
      })
      .catch(err => {
        let error =  JSON.parse(err._body);
        throw error.message;
      })
  }

  getRealTimeMapByAge(ageRange) {
    var token = this.loadToken()
    if(!token){
      return Promise.reject("User is not authenticated");
    }
    return this.http.get("http://localhost:3000/real-time/agerange/"+ageRange+"/").toPromise()
      .then(res => {
        var response = JSON.parse((res as any)._body);
        var newRealTimeMapData = response.message;
        this.realTimeMapData = newRealTimeMapData;
        console.log(this.realTimeMapData)
        return this.realTimeMapData
      })
      .catch(err => {
        let error =  JSON.parse(err._body);
        throw error.message;
      })
  }


  /**
   * IN PROGRESS
   * Add a new automatic notification
   */
  addAutomaticNotification(newNotification: any) {
    var token = this.loadToken()
    if(!token){
      return Promise.reject("User is not authenticated");
    }
    let email = this.getEmail();
    return this.authHttp.put("http://localhost:3000/businesses/" + email, newNotification)
  }

  getEmail() {
    let token = this.loadToken();
    return this.jwtHelper.decodeToken(token as string).email;
  }

  /**
   * Update business owner data
   */
  updateBusinessData(businessData: any){
    this.businessData = businessData;
  }
}
