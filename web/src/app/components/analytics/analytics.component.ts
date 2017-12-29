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

  public genderColors: Array<any> = [
    { // first color
      backgroundColor: 'blue',
      borderColor: 'black',
      pointBackgroundColor: 'rgba(225,10,24,0.2)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(225,10,24,0.2)'
    },
    { // second color
      backgroundColor: 'red',
      borderColor: 'black',
      pointBackgroundColor: 'rgba(225,10,24,0.2)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(225,10,24,0.2)'
    }];

    public hourColors: Array<any> = [
      { // first color
        backgroundColor: 'green',
        borderColor: 'black',
        pointBackgroundColor: 'green',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(225,10,24,0.2)'
      },
      { // second color
        backgroundColor: 'red',
        borderColor: 'rgba(225,10,24,0.2)',
        pointBackgroundColor: 'rgba(225,10,24,0.2)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(225,10,24,0.2)'
      }];

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
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          suggestedMin: 0
        }
      }]
    }
  };
  public ageOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
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
  public restaurantsLoaded: boolean = false;
  public tagsLoaded: boolean = false;

  public genderLabels: string[] =  [];
  public genderType: string = 'bar';
  public genderLegend:boolean = true;
  public genderData:any[] = [
    {data: [0], label: 'Male'},
    {data: [0], label: 'Female'}
  ];
  public hoursLabels: string[] =  [];
  public hoursType: string = 'bar';
  public hoursLegend:boolean = true;
  public hoursData:any[] = [];

  public restaurantsLabels: string[] =  [];
  public restaurantsType: string = 'horizontalBar';
  public restaurantsLegend:boolean = false;
  public restaurantsData:any[] = [20,50];

  public tagsLabels: string[] =  [];
  public tagsType: string = 'horizontalBar';
  public tagsLegend:boolean = false;
  public tagsData:any[] = [20,50];
  private email: string;


  constructor(http: HttpClient, authService: AuthenticationService) {
    this.http = http;
    this.authService = authService;
  }



  getGenderAnalytics(){ 
    return fetch(`${this.rootUrl}/`+"gender")
    .then((response: Response) => {
      return response.json();
    })
    .then((responseJson: any) => {
      return responseJson.message;
    })
    .then((message: any) => {
      this.genderData= [
        {data: [message[0].quantity], label: 'Male (' + message[0].percentage + "%)"},
        {data: [message[1].quantity], label: 'Female (' + message[1].percentage + "%)"},
      ];
      this.barChartGenderLoaded = true;
    });
  }

  getHourAnalytics(){ 
    return fetch(`${this.rootUrl}/`+"hour")
    .then((response: Response) => {
      return response.json();
    })
    .then((responseJson: any) => {
      return responseJson.message;
    })
    .then((message: any) => {

      var labels = [];
      var values = [];
      var percentages = [];
      for(var i  = 0; i < message.length; i++){
        labels.push(message[i].name + ":00");
        values.push(message[i].quantity);
        percentages.push(message[i].percentage);
      }

      this.hoursLabels = labels;
       this.hoursData= [
         {data: values},
       ];
       this.barChartHoursLoaded = true;

    });
  }
  getAnalyticsByType(type: String): Promise<Array<AnalyticsResponsePart>> {
    return fetch(`${this.rootUrl}/${type}`)
      .then((response: Response) => {
        return response.json();
      })
      .then((responseJson: any) => {
        return responseJson.message;
      });
  }


  getRankingByType(type: String): any {
    return fetch('http://localhost:3000/analytics/rankings/' + type)
      .then((response: Response) => {
        return response.json();
      })
      .then((responseJson: any) => {
        return responseJson.message;
      })
      .then((message: any) => {
       
          var size = message.length;
          if(size>10){
            size = 10;
          }
          var labels = [];
          var data = [];
          for(var i=0; i < size; i++){
            labels.push(message[i].name);
            data.push(message[i].percentage);
          }
          console.log(data);
          if(type=="restaurants"){
          this.restaurantsLabels = labels;
          this.restaurantsData = data;
          this.restaurantsLoaded = true;
          }
          else{
            this.tagsLabels = labels;
          this.tagsData = data;
          this.tagsLoaded = true;
          }
          // public restaurantsLabels: string[] =  ["uno","dos"];
          // public restaurantsType: string = 'horizontalBar';
          // public restaurantsLegend:boolean = true;
          // public restaurantsData:any[] = [20,50];
          // private email: string;

        
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
      return [part.name, part.percentage*100] as [any, number];
    }));
    return this.toDataset(map, keys);
  }

  toDataset(rawData: Map<any, number>, keys: Array<any>): number[] {
    return keys.map(key => rawData.get(key));
  }

  ngOnInit() {

    this.getGenderAnalytics();
    this.email = this.authService.getEmail();


    this.getRankingByType("tags");

    this.getRankingByType("restaurants");

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

    this.getHourAnalytics();
  }

}

class AnalyticsResponsePart {
  name: any;
  quantity: number;
  percentage: number;
}
