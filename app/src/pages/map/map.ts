import {Component, ElementRef, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../services/AuthenticationService';
import {HomePage} from "../home/home";
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
} from '@ionic-native/google-maps';

declare var google;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  email: string;
  constructor(public navCtrl: NavController, private http: HttpClient, private authenticationService:AuthenticationService, private googleMaps: GoogleMaps) {

    this.email = authenticationService.getEmail();

  }

  ionViewDidLoad() {
    this.loadMap();
  }

  logOut(){
    this.authenticationService.logout();
    this.navCtrl.push(HomePage);
  }


  loadMap(){

    var self = this;

    let latLng = new google.maps.LatLng(41.3967471,2.1558228);

    let mapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(self.mapElement.nativeElement, mapOptions);

  }


}
