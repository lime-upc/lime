import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/AuthenticationService';
import { Router } from '@angular/router';
import { google } from '@agm/core/services/google-maps-types';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import HeatmapOverlay from 'leaflet-heatmap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  date : String;

  selectedFilter: String = 'all-users';
  selectedGender: String;
  selectedLowerAge: String;
  selectedUpperAge: String;

  hideGenderSelector: boolean = true;
  hideAgeSelector: boolean =  true;

  ageRanges = [
    {value: '15', viewValue: '15'},
    {value: '20', viewValue: '20'},
    {value: '25', viewValue: '25'},
    {value: '30', viewValue: '30'},
    {value: '35', viewValue: '35'},
    {value: '40', viewValue: '40'},
    {value: '45', viewValue: '45'},
    {value: '50', viewValue: '50'},
    {value: '55', viewValue: '55'},
    {value: '60', viewValue: '60'},
    {value: '65+', viewValue: '65+'},
  ];

  /**
   * Location & density data depending on the filter
   */
  currentData = { max: 8, data: []};

  map: any;

  /**
   * Heatmap Configuration 
   */
  cfg = {
    "maxOpacity": .4, 
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    // if scaleRadius is false it will be the constant radius used in pixels
    "radius": 0.005, // scales the radius based on map zoom
    "scaleRadius": true, 
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries 
    //   (there will always be a red spot with useLocalExtremas true)
    "useLocalExtrema": true,
    latField: 'lat', // which field name in your data represents the latitude - default "lat"
    lngField: 'lng', // which field name in your data represents the longitude - default "lng"
    valueField: 'count' // which field name in your data represents the data value - default "value"
  };

  /**
   * Map layers
   */
  baseLayer = L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution: '...',
      maxZoom: 18
    }
  );
  heatmapLayer = new HeatmapOverlay(this.cfg);

  constructor(private auth: AuthenticationService, private router: Router) { 

    this.date = (new Date()).toDateString();
    
    if (!auth.isAuthentificated()) {
      router.navigate(['/login']);
    }
  }

  selectFilter() {
    if(this.selectedFilter == "all-users") {
      this.hideAgeSelector = true;
      this.hideGenderSelector = true;
    } 
    if (this.selectedFilter == "gender") {
      this.hideAgeSelector = true;
      this.hideGenderSelector = false;
    }
    if (this.selectedFilter == "age") {
      this.hideGenderSelector = true;
      this.hideAgeSelector = false;
    }
  }

  filterMap() {
    if (this.selectedFilter == "gender") {
      let currentData = this.auth.getRealTimeMapByGender("male").then(res => {
        this.currentData.data = res;
        this.heatmapLayer.setData(this.currentData); // Set the data to the heatmaplayer
        this.map.layers = [this.baseLayer, this.heatmapLayer]
      })
    }
    if (this.selectedFilter == "age") {

    }
  }

  ngOnInit() {
    let currentData = this.auth.getRealTimeMapByAllUser().then(res => {
      this.currentData.data = res;
      this.heatmapLayer.setData(this.currentData); // Set the data to the heatmaplayer
      this.map = new L.Map('map', {
        center: new L.LatLng(41.385064, 2.173403),
        zoom: 14,
        layers: [this.baseLayer, this.heatmapLayer]
      });
    })
  }

}
