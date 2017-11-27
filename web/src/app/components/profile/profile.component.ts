import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  displayedColumns = ['field', 'value'];
  dataSource = new MatTableDataSource<Profile>(PROFILE_DATA);
  notifications: Array<{title: string, description: string}> = [];

  constructor(private auth: AuthenticationService, router: Router) {
    if (!auth.isAuthentificated()) {
      router.navigate(['/login']);
    }
  }

  ngOnInit() {

    //On init, we load business data and update the view
    this.auth.getBusinessData()
      .then(business => {

        var profile: Profile[] = [

          //TODO: fill rest of the data
          {field: 'Type of business', value: 'My tags'},
          {field: 'Address', value: 'My business adress'},
          {field: 'Email', value: business.email},
          {field: 'Phone number', value: business.phone_number},
          {field: 'Person in charge', value: business.person_in_charge_name}
        ];

        this.dataSource = new MatTableDataSource<Profile>(profile);

      });

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
  {field: 'Type of business', value: ''},
  {field: 'Address', value: ''},
  {field: 'Email', value: ''},
  {field: 'Phone number', value: ''},
  {field: 'Person in charge', value: ''}
];


