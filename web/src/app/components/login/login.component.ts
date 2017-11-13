import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private http : Http) { }

  signUp(businessOwner) {
    return this.http.post('/api/signUp',{
      newBO : businessOwner
    })
  }

  ngOnInit() {
  }
}
