import { Component, OnInit } from '@angular/core';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ ModalService ]
})
export class ProfileComponent implements OnInit {

  businessTypes: Array<string>;
  address: string;
  email: string;
  phone: string;
  notifications: Array<{title: string, description: string}> = [];

  constructor(public modalService: ModalService) { }

  ngOnInit() {
    this.businessTypes = this.loadBusinessTypes();
    this.address = this.loadAddress();
    this.email = this.loadEmail();
    this.phone = this.loadPhone();
    this.addNotification('title1', 'description1');
    this.addNotification('title2', 'description2');
  }

  // TODO google places API

  loadBusinessTypes() {
    return ['Italian restaurant', 'Spanish food', 'Russian dessert'];
  }

  loadAddress() {
    return 'Campus Nord, C/Jordi Girona, 1-3, 08034 Barcelona';
  }

  loadEmail() {
    return 'lime-restaurant@bip.upc.com';
  }

  loadPhone() {
    return '+34 6 12 34 56 78';
  }

  addNotification(title: string, description: string) {
    this.notifications.push({title: title, description: description});
    this.notifications = this.notifications.slice(0);
  }

  openAddNotificationModal(modalId: string) {
    this.modalService.open(modalId);
  }
}
