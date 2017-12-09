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
  businessData: any = null;
  jwtHelper: JwtHelper = new JwtHelper();

  constructor(private http: Http, private router: Router,private authHttp: AuthHttp) {
      // set token if saved in local storage
      var currentToken = this.loadToken();
      console.log("Got token: " + currentToken);
  }

  /**
   * Returns is the user is authentificated or not
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
   * Add a new automatic notification
   */
  addAutomaticNotification(newNotification: any) {
    var token = this.loadToken()
    if(!token){
      return Promise.reject("User is not authenticated");
    }
    let email = this.jwtHelper.decodeToken(token as string).email
    return this.authHttp.put("http://localhost:3000/businesses/" + email, newNotification)
  }

  /**
   * Update business owner data
   */
  updateBusinessData(businessData: any){
    this.businessData = businessData;
  }
}
