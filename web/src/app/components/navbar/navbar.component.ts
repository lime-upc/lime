import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  currentPageName: String = "Real-time heat map"; // Default page when log in

  constructor(private auth: AuthenticationService) {
  }

  isHidden(){
    return !this.auth.isAuthentificated();
  }

  setCurrentPage(pageName) {
    this.currentPageName = pageName;
  }

  logout() {
    this.auth.logout();
  }

  ngOnInit() {}
}
