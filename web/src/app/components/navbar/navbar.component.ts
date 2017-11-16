import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {


  constructor(private auth: AuthenticationService) {}
  

  isHidden(){
    return !this.auth.isAuthentificated();
  }

  logout() {
    this.auth.logout();
  }

  ngOnInit() {}
}
