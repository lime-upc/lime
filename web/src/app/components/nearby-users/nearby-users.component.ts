import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from 'app/services/AuthenticationService';
import {Observable} from 'rxjs/Rx';

@Component({
  selector: 'app-nearby-users',
  templateUrl: './nearby-users.component.html',
  styleUrls: ['./nearby-users.component.scss']
})
export class NearbyUsersComponent implements OnInit {

  private http: HttpClient;
  private authService: AuthenticationService;

  rootUrl = "http://localhost:3000/real-time/users-nearby";

  ageRanges = [
    {value: '0', viewValue: '18-', from: 0, to: 17},
    {value: '18', viewValue: '18-25', from: 18, to: 25},
    {value: '26', viewValue: '26-30', from: 26, to: 30},
    {value: '31', viewValue: '31-35', from: 31, to: 35},
    {value: '36', viewValue: '36-40', from: 36, to: 40},
    {value: '41', viewValue: '41-45', from: 41, to: 45},
    {value: '46', viewValue: '46-50', from: 46, to: 50},
    {value: '51', viewValue: '51-55', from: 51, to: 55},
    {value: '56', viewValue: '56-60', from: 56, to: 60},
    {value: '61', viewValue: '61+', from: 61, to: 100000},
  ];

  genders = [
    // {value: 'all', viewValue: 'All'},
    {value: 'male', viewValue: 'Male'},
    {value: 'female', viewValue: 'Female'},
  ];

  public hideBarcharts: boolean = false;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: false,
    scales: {
      yAxes: [{
        ticks: {
          suggestedMin: 0
        }
      }]
    }
  };
  public barChartType: string = 'bar';
  public barChartLegend: boolean = false;
  public barChartColors: any[] = [
    {
      backgroundColor: 'rgba(150,150,250,0.6)',
      borderColor: 'rgba(110,110,187,1)',
      hoverBackgroundColor: 'rgba(110,110,187,1)'
    }
  ];

  public barChartGenderLabels: string[] = this.genders.map(gender => gender.value);
  public barChartGenderData: number[];
  public barChartGenderLoaded: boolean = false;

  public barChartAgeLabels: string[] = this.ageRanges.map(ageRange => ageRange.viewValue);
  public barChartAgeData: number[] = [];
  public barChartAgeLoaded: boolean = false;

  private email: string;
  public businessCoord: string;
  public businessCoordComma: string;

  public usersCounter = 0;


  constructor(http: HttpClient, authService: AuthenticationService) {
    this.http = http;
    this.authService = authService;
  }

  getUsersCounter(): Promise<number> {
    return fetch(`${this.rootUrl}/counter/${this.businessCoord}`)
      .then((response: Response) => {
        return response.json();
      })
      .then((responseJson: any) => {
        return responseJson.message.counter;
      });
  }

  getGenderAnalytics(): Promise<Array<number>> {
    return fetch(`${this.rootUrl}/gender/${this.businessCoord}`)
      .then((response: Response) => {
        return response.json();
      })
      .then((responseJson: any) => {
        return [responseJson.message.maleCounter, responseJson.message.femaleCounter];
      });
  }


  getAgeAnalytics(): Promise<Map<string, number>> {
    return fetch(`${this.rootUrl}/age/${this.businessCoord}`)
      .then((response: Response) => {
        return response.json();
      })
      .then((responseJson: any) => {
        return responseJson.message;
      });
  }


  loadData(){
    this.email = this.authService.getEmail();

    this.authService.getBusinessData()
      .then(businessOwner => {
        //this.businessCoord = businessOwner.business.location.coordinates[1]+"-"+businessOwner.business.location.coordinates[0];
        this.businessCoord = "41.403179698781706-2.188036194469206"; //test coordinates

        this.businessCoordComma = this.businessCoord.replace ("-",",");
        console.log(this.businessCoordComma);


        this.getUsersCounter()
          .then(data => {
            this.usersCounter = data;
          });

        this.getGenderAnalytics()
          .then(data => {
            let map = new Map(([ ['male', data[0]], ['female', data[1]] ]));
            let keys = this.barChartGenderLabels;
            this.barChartGenderData = keys.map(key => map.get(key));
            this.barChartGenderLoaded = true;

          });

        this.getAgeAnalytics()
          .then(data => {

            let ageStats = this.ageRanges.map(range => {
              return {
                key: range.viewValue,
                from: range.from,
                to: range.to,
                quantity: 0
              };
            });

            Object.keys(data).forEach(function(k){
              let suitableAgeStat =
                ageStats.find(ageStat => parseInt(k) >= ageStat.from && parseInt(k) <= ageStat.to);
              suitableAgeStat.quantity += data[k];
            });

            this.barChartAgeLabels = ageStats.map(ageStat => ageStat.key);
            this.barChartAgeData = ageStats.map(ageStat => ageStat.quantity);
            this.barChartAgeLoaded = true;

          });

      });
  }

  ngOnInit() {
    this.loadData();

    Observable.interval(1000).subscribe(x => {
      this.loadData();
      });
  }

}
