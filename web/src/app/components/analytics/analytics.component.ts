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


    public ageColors: Array<any> = [
      { // first color
        backgroundColor: 'orange',
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
 
  public txsOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [{id: 'y-axis-1', type: 'linear', position: 'left', ticks: {min: 0}}]
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
//Include fake data when the server is off

  public txsLabels: string[] = ["2018 week 1","2018 week 2","2018 week 3"];
  public txsData: number[] = [15412,12121,17421];
  public txsLoaded: boolean = true;

  public hourLabels: string[] = ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
  public hourData: number[] = [34,34,65,43,56,42,23,65,34,65,76,23,56,78,65,34,56,76,65,45,67,45,65,45];

  public ageLabels: string[] = ["20","30","40","50","60","70"];
  public ageData: number[] = [43,12,76,21,86,12];

  public inViewTxs: number = 0;
  public genderLegend:boolean = true;
  public genderData:any[] = [
    {data: [65], label: 'Male'},
    {data: [124], label: 'Female'}
  ];
  public genderLabels: string[] = [];


  public restaurantsLabels: string[] =  [];
  public restaurantsType: string = 'horizontalBar';
  public restaurantsLegend:boolean = false;
  public restaurantsData:any[] = [20,50];

  public tagsLabels: string[] =  [];
  public tagsType: string = 'horizontalBar';
  public tagsLegend:boolean = false;
  public tagsData:any[] = [20,50];
  public tagsLoaded: boolean = false;
  public restaurantsLoaded: boolean = false;
  private email: string;

  //Saves state about granularity. Changes with roll-up and drill-down
  private granularity: any;

  constructor(http: HttpClient, authService: AuthenticationService) {
    this.http = http;
    this.authService = authService;
  }


//Used to fire a drillDown
drillDown(newStart){

  if(this.granularity.width=="hour") return; //Cannot drill down more
  this.granularity.previous.push(this.granularity.start); //Current start goes to list
  this.granularity.start = newStart; //Update Start
  if (this.granularity.width=="week") {this.granularity.width="day"; this.granularity.long = "7"}
  else if (this.granularity.width=="day") {this.granularity.width="hour"; this.granularity.long = "1"}

  this.getTxsData();
  this.getHourData();
  this.getAgeData();
  this.getGenderData();
}

//Used to fire a rollUp
rollUp(){
  if(this.granularity.width=="week") return; //Cannot roll up more
  if (this.granularity.width=="day") {this.granularity.width="week"; this.granularity.long = "30"}
  else if (this.granularity.width=="hour") {this.granularity.width="day"; this.granularity.long = "7"};
  this.granularity.start = this.granularity.previous[this.granularity.previous.length-1];
  //Remove last element from the array
  this.granularity.previous.splice(-1,1);

  this.getTxsData();
  this.getHourData();
  this.getAgeData();
  this.getGenderData();
}

getTxsData(){
  return fetch("http://localhost:3000/analytics/transactions/" + this.granularity.start + "/" + this.granularity.long + "/" + this.granularity.width)
  .then((response: Response) => {
    return response.json();
  })
  .then((responseJson: any) => {
    var m = responseJson.message;
    if(this.granularity.width=="hour"){
      m.sort(this.compare);
    }
    var newData = [];
    this.inViewTxs = 0;
    for(var i = 0; i < m.length;i++){
       this.txsLabels[i] = m[i].name;
       newData.push(m[i].count);
       this.inViewTxs+=m[i].count;
    }
    for(var j = this.txsLabels.length-m.length; j > 0; j--){
      this.txsLabels.pop();
    }
    this.txsData = newData;
  });
}

getGenderData(){
  return fetch("http://localhost:3000/analytics/transactions/" + this.granularity.start + "/" + this.granularity.long + "/gender")
  .then((response: Response) => {
    return response.json();
  })
  .then((responseJson: any) => {
    var m = responseJson.message;
    this.genderData = [
      {data: [m[0].count], label:m[0].name},
      {data: [m[1].count], label:m[1].name},
    ]
   
  });

}


getHourData(){
  return fetch("http://localhost:3000/analytics/transactions/" + this.granularity.start + "/" + this.granularity.long + "/hour")
  .then((response: Response) => {
    return response.json();
  })
  .then((responseJson: any) => {
    var m = responseJson.message;
    m.sort(this.compare);
    var newData = [];
    for(var i = 0; i < m.length;i++){
       this.hourLabels[i] = m[i].name;
       newData.push(m[i].count);
    }
    for(var j = this.hourLabels.length-m.length; j > 0; j--){
      this.hourLabels.pop();
    }
    this.hourData = newData;
  });
}

getAgeData(){
  return fetch("http://localhost:3000/analytics/transactions/" + this.granularity.start + "/" + this.granularity.long + "/age")
  .then((response: Response) => {
    return response.json();
  })
  .then((responseJson: any) => {
    var m = responseJson.message;
    m.sort(this.compare);
    var newData = [];
    for(var i = 0; i < m.length;i++){
       this.ageLabels[i] = m[i].name;
       newData.push(m[i].count);
    }
    for(var j = this.ageLabels.length-m.length; j > 0; j--){
      this.ageLabels.pop();
    }
    this.ageData = newData;
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

 
txsClicked(e:any):void {
  this.drillDown(e.active[0]._model.label);
}

compare(a,b) {
  if (parseInt(a.name) < parseInt(b.name))
    return -1;
  if (parseInt(a.name) > parseInt(b.name))
    return 1;
  return 0;
}


  ngOnInit() {

    //Set initial criteria
    var monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth()-1);

    //Initial granularity is previuos month with week criteria
    this.granularity = {
      width: "week",
      long: "30",
      start: monthAgo.toISOString().substring(0, 10),
      previous: []
    };


    this.getTxsData();
    this.getHourData();
    this.getAgeData();
    this.getGenderData();
    this.getRankingByType("tags");

    this.getRankingByType("restaurants");

    console.log(this.granularity);


  }


textdateToPrety(text,offset){
  var d = this.textToDate(text);
  if(offset!=0) d = this.addDays(d,offset);
  
  
  return ("00" + (d.getDate() )).slice(-2) + "/" + 
  ("00" + (d.getMonth()+1)).slice(-2) + "/" + 
  d.getFullYear() + " " + 
  ("00" + d.getHours()).slice(-2) + ":" + 
  ("00" + d.getMinutes()).slice(-2);
}

addDays(date,days) {        
  var one_day=1000*60*60*24; 
  return new Date(date.getTime()+(days*one_day) - 1); 
}

textToDate(text){
    //YYYY
    var match = text.match(/^(\d*)$/);
    if(match!=null){
        return new Date(match[1])
    }
    //YYYY-MM
    match = text.match(/^(\d*)-(\d*)$/);
     if(match!=null){
        return new Date(match[1],match[2]-1)
    }
    //YYYY-MM-DD
    match = text.match(/^(\d*)-(\d*)-(\d*)$/);
     if(match!=null){
        return new Date(match[1],match[2]-1,match[3])
    }
    //YY-MM-DD HHh
    match = text.match(/^(\d*)-(\d*)-(\d*) (\d*)h$/);
     if(match!=null){
        return new Date(match[1],match[2]-1,match[3],match[4])
    }
    
    //YY-MM-DD week WW
    match = text.match(/^(\d*) week (\d*)$/);
     if(match!=null){
         var d = (1 + (match[2] - 1) * 7); // 1st of January + 7 days for each week
        return new Date(match[1], 0, d);
    }

}


}

class AnalyticsResponsePart {
  name: any;
  quantity: number;
  percentage: number;
}
