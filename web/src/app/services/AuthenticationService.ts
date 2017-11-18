import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'


@Injectable()
export class AuthenticationService {

  public token: string;
  
  constructor(private http: Http, private router: Router) {
      // set token if saved in local storage
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
  }

  isAuthentificated() {
    return this.token != undefined;
  }
  
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
  
  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']); 
  }
}