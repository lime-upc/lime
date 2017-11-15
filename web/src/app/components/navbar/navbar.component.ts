import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  isHidden;

  constructor(private auth: AuthenticationService) { 
    this.isHidden = !auth.isAuthentificated();
  }
  
  logout() {
    this.auth.logout();
  }

  ngOnInit() {}
}
