import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../services/AuthenticationService';
import { Observable } from "rxjs/Observable";
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  backendRoot = "http://localhost:3000";
  backend = this.backendRoot + "/transactions";
  dataSource = new MatTableDataSource();
  displayedColumns = ['id', 'user', 'total', 'received', 'vmu', 'ts'];

  constructor(private http: HttpClient, private auth: AuthenticationService) {

  }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    let boEmail = this.auth.getEmail();
    this.getData(boEmail).subscribe(response => {
      if (response.error == false) {
        this.updateTable(response.message);
      } else {
        alert(response.message);
      }
    }, error => {
      alert(error);
    })
  }

  private getUrlForBo(bo: string) {
    return this.backend + "?bo=" + bo;
  }

  private getData(bo: string): Observable<any> {
    return this.http.get<Response>(this.getUrlForBo(bo));
  }

  private updateTable(transactions: Array<Transaction>) {
    this.dataSource = new MatTableDataSource(transactions);
    console.log(transactions);
  }
}

class Transaction {
  _id: string;
  user: string;
  business_owner: string;
  timestamp: number;
  total_amount: number;
  virtual_money_used: number;
  payback_amount: number;
}
