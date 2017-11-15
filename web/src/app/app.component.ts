import { Component } from '@angular/core';
import { AuthenticationService } from './services/AuthenticationService';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  loggedIn = false;

  constructor(private auth: AuthenticationService, private router: Router) {
    this.loggedIn = this.auth.isAuthentificated();
  }
  
 }
