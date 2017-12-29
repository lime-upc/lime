import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from 'app/services/AuthenticationService';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  private http: HttpClient;
  private authService: AuthenticationService;

  rootUrl = "http://localhost:3000/analytics/transactions";
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
  hours = [
    {value: 0, viewValue: '12AM'},
    {value: 1, viewValue: '1AM'},
    {value: 2, viewValue: '2AM'},
    {value: 3, viewValue: '3AM'},
    {value: 4, viewValue: '4AM'},
    {value: 5, viewValue: '5AM'},
    {value: 6, viewValue: '6AM'},
    {value: 7, viewValue: '7AM'},
    {value: 8, viewValue: '8AM'},
    {value: 9, viewValue: '9AM'},
    {value: 10, viewValue: '10AM'},
    {value: 11, viewValue: '11AM'},
    {value: 12, viewValue: '12PM'},
    {value: 13, viewValue: '1PM'},
    {value: 14, viewValue: '2PM'},
    {value: 15, viewValue: '3PM'},
    {value: 16, viewValue: '4PM'},
    {value: 17, viewValue: '5PM'},
    {value: 18, viewValue: '6PM'},
    {value: 19, viewValue: '7PM'},
    {value: 20, viewValue: '8PM'},
    {value: 21, viewValue: '9PM'},
    {value: 22, viewValue: '10PM'},
    {value: 23, viewValue: '11PM'},
  ];


  topRestaurants = []

  tags = []
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

  public barChartAgeLabels: string[] = this.ageRanges.map(ageRange => ageRange.viewValue);
  public barChartAgeData: number[] = [];
  public barChartAgeLoaded: boolean = false;

  public barChartGenderLabels: string[] = this.genders.map(gender => gender.value);
  public barChartGenderData: number[];
  public barChartGenderLoaded: boolean = false;

  public barChartHoursLabels: string[] = this.hours.map(hours => hours.viewValue);
  public barChartHoursData: number[];
  public barChartHoursLoaded: boolean = false;

  private email: string;


  constructor(http: HttpClient, authService: AuthenticationService) {
    this.http = http;
    this.authService = authService;
  }

  getAnalyticsByType(type: String): Promise<Array<AnalyticsResponsePart>> {
    return fetch(`${this.rootUrl}/${type}/${this.email}`)
      .then((response: Response) => {
        return response.json();
      })
      .then((responseJson: any) => {
        return responseJson.message;
      });
  }


  getRankingByType(type: String): Promise<Array<AnalyticsResponsePart>> {
    return fetch('http://localhost:3000/analytics/rankings/' + type)
      .then((response: Response) => {
        return response.json();
      })
      .then((responseJson: any) => {
        return responseJson.message;
      });
  }

  toRelativeDataset(rawData: Array<AnalyticsResponsePart>, keys: Array<any>): number[] {
    let map = new Map<any, number>(rawData.map(part => {
      return [part.name, part.percentage] as [any, number];
    }));
    return this.toDataset(map, keys);
  }

  toAbsoluteDataset(rawData: Array<AnalyticsResponsePart>, keys: Array<any>): number[] {
    let map = new Map<any, number>(rawData.map(part => {
      return [part.name, part.quantity] as [any, number];
    }));
    return this.toDataset(map, keys);
  }

  toDataset(rawData: Map<any, number>, keys: Array<any>): number[] {
    return keys.map(key => rawData.get(key));
  }

  ngOnInit() {
    this.email = this.authService.getEmail();
    this.getAnalyticsByType("gender")
      .then(data => {
        this.barChartGenderData = this.toAbsoluteDataset(data, this.barChartGenderLabels);
        this.barChartGenderLoaded = true;
      });

    this.getRankingByType("tags")
    .then(data => {
        this.tags = data;
    });

    this.getRankingByType("restaurants")
    .then(data => {
        this.topRestaurants = data;

    });

    this.getAnalyticsByType("age")
      .then(data => {
        let ageToQuantityMap = data.map(part => { return {'age': part.name, 'quantity': part.quantity}});
        let ageStats = this.ageRanges.map(range => {
          return {
            key: range.viewValue,
            from: range.from,
            to: range.to,
            quantity: 0
          };
        });
        ageToQuantityMap.forEach(ageToQuantity => {
          let suitableAgeStat =
            ageStats.find(ageStat => ageToQuantity.age >= ageStat.from && ageToQuantity.age <= ageStat.to);
          suitableAgeStat.quantity += ageToQuantity.quantity;
        });
        this.barChartAgeLabels = ageStats.map(ageStat => ageStat.key);
        this.barChartAgeData = ageStats.map(ageStat => ageStat.quantity);
        this.barChartAgeLoaded = true;
      });

    this.getAnalyticsByType("hour")
      .then(data => {
        this.barChartHoursLabels = this.hours.map(hour => hour.viewValue);
        this.barChartHoursData = this.toAbsoluteDataset(data, this.hours.map(hour => "" + hour.value));
        this.barChartHoursLoaded = true;
      });
  }

}

class AnalyticsResponsePart {
  name: any;
  quantity: number;
  percentage: number;
}
