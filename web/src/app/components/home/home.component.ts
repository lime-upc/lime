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
    data: [
      {lat: 41.396583354381335, lng:2.296390703227544, count: 5},
      {lat: 41.381333652516005, lng:2.5676861203867216, count: 4},
      {lat: 41.38451413367245, lng: 2.386171278364763,count: 4},
      {lat: 41.39410476743153, lng: 2.2093469273618496, count: 4},
      {lat: 41.38346162988568, lng: 2.2951472742916526, count: 3},
      {lat: 41.384028678398224,lng: 2.5669579254688375, count: 3},
      {lat: 41.39121764783445, lng: 2.0259446110227306, count: 3},
      {lat: 41.401405487630704, lng: 2.3841530964653748, count: 3},
      {lat: 41.40375441296311, lng: 1.9349010980835248, count: 3},
      {lat: 41.405241251856765, lng: 2.5676410997995136, count: 3},
      {lat: 41.4044991, lng: 2.17429, count: 3},
      {lat: 41.38176760, lng:2.17156, count: 4}
    ]
  };

  /**
   * Location & density data depending on the filter
   */
  general_map_data;
  age_map_data;
  female_map_data;
  male_map_data;

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
    this.general_map_data = this.auth.getRealTimeMap();
    this.heatmapLayer.setData(this.testData); // Set the data to the heatmaplayer
    this.map = new L.Map('map', {
      center: new L.LatLng(41.385064, 2.173403),
      zoom: 14,
      layers: [this.baseLayer, this.heatmapLayer]
    });
  }
}
