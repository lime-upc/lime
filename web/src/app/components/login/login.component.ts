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
              private authenticationService: AuthenticationService,
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
    this.authenticationService.login(this.formData.email, this.formData.password)
        .subscribe(result => {
            if (result === true) {
                this.router.navigate(['/']);
            } else {
                alert('Email or password incorrect')
            }
        });
  }

  /*signIn(){
    
    //Restart errors
    var hasError = false;
    this.errors = {
      email: undefined,
      password: undefined
    
    };
    
    //Copy the form data into loginData variable
    var loginData =  JSON.parse(JSON.stringify(this.formData));
    
    //Check for errors
    this.errors.email = !loginData.email;
    this.errors.password = !loginData.password;
    for (let key in this.errors){
      if (this.errors[key]) {hasError = true;}
    }
    
    //Do not do anything if there is any error
    if(hasError){
      alert("Please, fill your details");
    } else {//If no error, we submit
        this.authHttp.post('http://localhost:3000/businesses/login', loginData)
          .subscribe(
            res => {
              //Success!! Store token in localStorage
              var response = JSON.parse((res as any)._body);
              this.authenticationService.setTokenAndFetchData(response.message)
                .then(res => {
                  this.router.navigate(['/']);
                });
    
            },
            err => {
              //Show error
              var error = JSON.parse(err._body);
            }
          );
    
      
    }  
  }*/

  ngOnInit() {
  }
}
