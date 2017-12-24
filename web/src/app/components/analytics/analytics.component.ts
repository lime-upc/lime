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


  topRestaurants = [
    {"name":"Pastisseria Diaz (Carrer Diagonal)","percentage":1.54},{"name":"Majestic Hotel & Spa Barcelona GL (Passeig de Gràcia)","percentage":1.49},{"name":"Flaherty´s Irish Pub Barcelona (Plaza Joaquim Xirau)","percentage":1.47},{"name":"W Barcelona (Placa de la Rosa dels Vents)","percentage":1.4500000000000002},{"name":"Gran París (Carrer de Muntaner)","percentage":1.4500000000000002},{"name":"Boston Pizza Numancia (Carrer de Numància)","percentage":1.41},{"name":"Barnabier (Torre Mapfre)","percentage":1.41},{"name":"Pastisseria Roca (Carrer Major)","percentage":1.4000000000000001},{"name":"Cup & Cake (Carrer d'Enric Granados)","percentage":1.4000000000000001},{"name":"Pizza Sapri (Carrer Gran de Sant Andreu)","percentage":1.39},{"name":"Restaurant Marmalade (Carrer de la Riera Alta)","percentage":1.38},{"name":"El Pescadito de Mandri (Carrer de Mandri)","percentage":1.38},{"name":"Hotel Novotel Barcelona City (Avinguda Diagonal)","percentage":1.37},{"name":"Hotel Constanza Barcelona (Carrer del Bruc)","percentage":1.37},{"name":"El Principal Del Eixample (Carrer de Provença)","percentage":1.35},{"name":"Piper's Tavern (C/ Buenos Aires)","percentage":1.34},{"name":"Nice Spice (Carrer de Pujades)","percentage":1.3299999999999998},{"name":"Hotel Duquesa de Cardona Barcelona (Passeig de Colom)","percentage":1.3299999999999998},{"name":"Little Bacoa Born (Carrer de Colomines)","percentage":1.3299999999999998},{"name":"Caelum (Carrer de la Palla)","percentage":1.3299999999999998},{"name":"Hofmann Pastisseria (Carrer dels Flassaders)","percentage":1.32},{"name":"El Forn Del Barri (Carrer de la Indústria)","percentage":1.3},{"name":"Pestana Arena Barcelona (Carrer del Consell de Cent)","percentage":1.3},{"name":"Masedy 2001 S.L. (Avinguda de Madrid)","percentage":1.3},{"name":"Domino's Pizza (Carrer del Freser)","percentage":1.3},{"name":"Boston Pizza Alfons XII (Carrer d'Alfons XII)","percentage":1.3},{"name":"Restaurante Alba Granados (Carrer d'Enric Granados)","percentage":1.3},{"name":"Hotel NH Hesperia Barcelona Presidente (Avinguda Diagonal)","percentage":1.28},{"name":"Habana Vieja (Carrer dels Banys Vells)","percentage":1.27},{"name":"ILUNION Barcelona (Carrer de Ramon Turró)","percentage":1.27}
  ]

  tags = [{"name":"french_restaurant","quantity":1762,"percentage":17.62},{"name":"sushi_restaurant","quantity":1511,"percentage":15.110000000000001},{"name":"cafe","quantity":1503,"percentage":15.03},{"name":"pizza_restaurant","quantity":1494,"percentage":14.940000000000001},{"name":"japanese_restaurant","quantity":1428,"percentage":14.280000000000001},{"name":"diner","quantity":1394,"percentage":13.94},{"name":"sandwich_shop","quantity":1353,"percentage":13.530000000000001},{"name":"buffet_restaurant","quantity":1343,"percentage":13.43},{"name":"breakfast_restaurant","quantity":1249,"percentage":12.49},{"name":"coffee_shop","quantity":1227,"percentage":12.27},{"name":"sports_bar","quantity":1222,"percentage":12.22},{"name":"asian_restaurant","quantity":1160,"percentage":11.600000000000001},{"name":"pub","quantity":1160,"percentage":11.600000000000001},{"name":"hamburger_restaurant","quantity":1158,"percentage":11.58},{"name":"bar","quantity":1087,"percentage":10.870000000000001},{"name":"indian_restaurant","quantity":971,"percentage":9.71},{"name":"italian_restaurant","quantity":966,"percentage":9.66},{"name":"deli","quantity":963,"percentage":9.629999999999999},{"name":"restaurant","quantity":959,"percentage":9.59},{"name":"seafood_restaurant","quantity":893,"percentage":8.93},{"name":"tea_house","quantity":878,"percentage":8.780000000000001},{"name":"chinese_restaurant","quantity":872,"percentage":8.72},{"name":"american_restaurant","quantity":868,"percentage":8.68},{"name":"bar_grill","quantity":855,"percentage":8.55},{"name":"pizza_delivery","quantity":842,"percentage":8.42},{"name":"liban_restaurant","quantity":774,"percentage":7.739999999999999},{"name":"korean_restaurant","quantity":756,"percentage":7.5600000000000005},{"name":"bakery","quantity":745,"percentage":7.449999999999999},{"name":"steak_house","quantity":736,"percentage":7.359999999999999},{"name":"barbecue_restaurant","quantity":725,"percentage":7.249999999999999}]

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
