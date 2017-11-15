import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { AuthenticationService } from '../../services/AuthenticationService';
import { AuthHttp } from 'angular2-jwt';
import { Router } from '@angular/router';

type loginData = {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  formData: loginData;
  errors: any;

  constructor(private http : Http,
              private auth: AuthenticationService,
              private router: Router) { 
        
                //To store the local errors
        this.errors = {
          email: undefined,
          password: undefined
        };
    
        //To store the input data
        this.formData = {
          email: "",
          password: ""
        };
  }

  signIn() {
    this.auth.login(this.formData.email, this.formData.password)
        .subscribe(result => {
        if (result === true) {
            this.router.navigate(['/']);
        } else {
          alert('Email or password incorrect')
        }
    });
  }

  ngOnInit() {
  }
}
