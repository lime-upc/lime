import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { Http } from '@angular/http';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  displayedColumns = ['field', 'value'];
  dataSource = new MatTableDataSource<Profile>(PROFILE_DATA);
  notifications: Array<{title: string, description: string}> = [];
  businessData: any = {};

  constructor(private auth: AuthenticationService, router: Router, http: Http) { 
    if (!auth.isAuthentificated()) {
      router.navigate(['/login']);
    }
  }

  ngOnInit() {
    /*this.businessData = this.auth.getBusinessData().then(businessData => {
      this.businessData = businessData;
      console.log(this.businessData);
    })
    .catch(message => {
      alert("ERROR: " + message);
    });*/
  }

  addNotification(title: string, description: string) {
    this.notifications.push({title: title, description: description});
    this.notifications = this.notifications.slice(0);
  }
}

export interface Profile {
  field: String;
  value: String;
}

const PROFILE_DATA: Profile[] = [
  {field: 'Type of business', value: 'My tags'},
  {field: 'Address', value: 'My business adress'},
  {field: 'Email', value: 'My email'}, 
  {field: 'Phone number', value: 'My phone number'},
  {field: 'Person in charge', value: 'Me'}
];


