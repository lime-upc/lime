import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private auth: AuthenticationService, router: Router) { 
    if (!auth.isAuthentificated()) {
      router.navigate(['/login']);
    }
  }

  logout() {
    this.auth.logout();
  }

  ngOnInit() {
  }
}
