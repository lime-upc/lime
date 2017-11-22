import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  date : String; 
  selected: String;

  coordinates = {
    barcelona: {
      lat:41.385064,
      long: 2.173403,
      zoom: 14,
    },
    upc: {
      lat:41.388004,
      long: 2.113280
    }
  }

  constructor(private auth: AuthenticationService, router: Router) { 
    this.date = (new Date()).toDateString();
    this.selected = 'all-users';
    
    if (!auth.isAuthentificated()) {
      router.navigate(['/login']);
    }
  }

  ngOnInit() {
  }
}
