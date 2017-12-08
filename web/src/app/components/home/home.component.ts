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
  selected: String;
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

  testData = {
    max: 8,
    data: [{lat: 41.4044991, lng: 2.17429, count: 3},{lat: 41.38176760, lng:2.17156, count: 4}]
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
    this.selected = 'all-users';
    
    if (!auth.isAuthentificated()) {
      router.navigate(['/login']);
    }
  }

  ngOnInit() {
    this.heatmapLayer.setData(this.testData);
    this.map = new L.Map('map', {
      center: new L.LatLng(41.385064, 2.173403),
      zoom: 14,
      layers: [this.baseLayer, this.heatmapLayer]
    });
  }
}
