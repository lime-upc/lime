import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { JwtHelper } from 'angular2-jwt';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'


@Injectable()
export class AuthenticationService {

  public token: string = null;
  businessData: any = {};
  jwtHelper: JwtHelper = new JwtHelper();
  
  constructor(private http: Http, private router: Router) {
      // set token if saved in local storage
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
  }

  /**
   * Returns is the user is authentificated or not
   */
  isAuthentificated() {
    return this.token != undefined;
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
          // set token property
          this.token = token;
  
          // store email and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify({ email: email, token: token }));
  
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
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']); 
  }

  /**
   * Get business owner's data
   */
  /*getBusinessData(){
    return this.loadToken()
    .then(token => {
      if (this.token && this.businessData){ //Data already loaded
        return Promise.resolve(this.businessData);
      }
      return this.loadBusinessData();
    }) 
    
  }

  private loadBusinessData() {
    return this.loadToken()
    .then(token => {
      if(!token){
        throw "User is not authenticated";
      }
      let email = this.jwtHelper.decodeToken(token as string).email;
      return this.http.get('http://localhost:3000/businesses/' + email)
        .toPromise()
        .then(res => {

          var response = JSON.parse((res as any)._body);
          var newData = response.message;

          console.log(newData);
          this.businessData = {};
          this.businessData.email = newData.email;
          this.businessData.person_in_charge_name = newData.person_in_charge_name;
          this.businessData.phone_number = newData.phone_number;
          this.businessData.business = newData.business;
          return this.businessData;
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

  private loadToken(){
    return localStorage.getItem('currentUser')
      .then((val) => {
        console.log("Loaded token: " + val.token);
        this.token = val.token;
        return this.token;
      });
  }*/

  /**
   * Update business owner data
   */
  updateBusinessData(businessData: any){
    this.businessData = businessData;
  }
}
