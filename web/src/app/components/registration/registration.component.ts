import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

type businessProfile = {
  email: string;
  password: string;
  person_in_charge_name: string;
  address: string;
  phone_number: string;
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})

export class RegistrationComponent implements OnInit {

  formData: businessProfile;
  errors: any;

  constructor(private http : Http, private router: Router) { 

     //To store the local errors
     this.errors = {
      email: undefined,
      password: undefined,
      first_name: undefined,
      last_name: undefined,
      date_of_birth: undefined,
      gender: undefined,
      preferences: undefined
    };

    //To store the input data
    this.formData = {
      email: '',
      password: '',
      person_in_charge_name: '',
      address: '',
      phone_number: '',
    };

  }

  signUp() {

    //Restart errors
    var hasError = false;
    this.errors = {
      email: undefined,
      password: undefined,
      person_in_charge_name: undefined,
      address: undefined,
      phone_number: undefined,
    };

    //Copy the form data into businessData variable
    var businessData =  JSON.parse(JSON.stringify(this.formData));

    //Check for errors
    this.errors.email = !businessData.email;
    this.errors.password = !businessData.password;
    for (let key in this.errors){
      if (this.errors[key]) {hasError = true;}
    }

    if(hasError){
      alert('All the field are required');
    } else {
      this.http.post('http://localhost:3000/businesses/register', businessData)
      .subscribe(
        res => {
          this.router.navigate(['/']); // Redirect to home page after success
          alert('Success : you are registered !');
        },
        err => {
          alert('Error : the registration has failed');
          //var error = JSON.parse(err.error);
        }
      );
    }

  }

  ngOnInit() {
  }
}
