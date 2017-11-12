import {Component, ElementRef, ViewChild} from '@angular/core';
import {MenuController, NavController, ToastController} from 'ionic-angular';
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
  map: any;
  userData: any = {};
  constructor(public navCtrl: NavController, private http: HttpClient, private authenticationService:AuthenticationService,
              private googleMaps: GoogleMaps, private menu: MenuController,private toast: ToastController) {

    this.menu.enable(true);
    this.menu.swipeEnable(true);

  }


  //Load user data
  ionViewDidEnter(){
    this.authenticationService.getUserData()
      .then(userData => {
        this.userData = userData
      })
      .catch(message => {
        alert("ERROR: " + message);
      });
  }

  ionViewDidLoad() {
    this.loadMap();
  }

  logOut(){
    this.authenticationService.logout();
    this.toast.create(
      {message: 'See you soon!',
        duration: 3000,
        position: 'bottom'}
    ).present();
    this.navCtrl.setRoot(HomePage);
  }


  loadMap(){
    this.menu.enable(true);
    this.menu.swipeEnable(true);

    var self = this;

    let latLng = new google.maps.LatLng(41.3967471,2.1558228);

    let mapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };

    this.map = new google.maps.Map(self.mapElement.nativeElement, mapOptions);

  }


}
