import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';
import { Router } from '@angular/router';
import { MatTableDataSource, MatRadioButton, MatButtonToggleModule } from '@angular/material';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {

  displayedColumns = ['field', 'value']
  dataSource = new MatTableDataSource<Profile>(PROFILE_DATA)
  notifications: Array<{title: string, description: string}> = []
  hideNotifForm: boolean
  newNotification: {title: string, description: string;}
  toggleText: string

  constructor(private auth: AuthenticationService, router: Router) {
    if (!auth.isAuthentificated()) {
      router.navigate(['/login']);
    }

    this.toggleText="New notification"
    this.hideNotifForm = true
    this.newNotification = {
      title: "",
      description: ""
    }
  }

  ngOnInit() {

    //On init, we load business data and update the view
    this.auth.getBusinessData()
      .then(businessOwner => {

        var profile: Profile[] = [

          //TODO: fill rest of the data
          {field: 'Type of business', value: 'My tags'},
          {field: 'Address', value: 'My business adress'},
          {field: 'Email', value: businessOwner.email},
          {field: 'Phone number', value: businessOwner.phone_number},
          {field: 'Person in charge', value: businessOwner.person_in_charge_name}
        ];
        this.dataSource = new MatTableDataSource<Profile>(profile)
        
        //Load automatic notifications to display them in the profile
        this.notifications = businessOwner.automatic_notifications
      });

  }

  toggleNewNotifForm() {
    if (!this.hideNotifForm) {
      this.toggleText="New notification"
    } else {
      this.toggleText="Cancel"
    }
    this.hideNotifForm = !this.hideNotifForm
    return this.hideNotifForm
  }

  addNotification() {
    this.notifications.push(this.newNotification);
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


