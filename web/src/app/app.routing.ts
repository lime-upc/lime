import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { PageNotFoundComponent } from './components/pageNotFound/pageNotFound.component';
import { ProfileComponent } from "./components/profile/profile.component";
import { AnalyticsComponent } from "./components/analytics/analytics.component";
import { BoAnalyticsComponent } from "./components/boAnalytics/analytics.component";

import { NearbyUsersComponent } from "./components/nearby-users/nearby-users.component";


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registration',
    component: RegistrationComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'analytics',
    component: AnalyticsComponent
  },
  {
    path: 'boAnalytics',
    component: BoAnalyticsComponent
  },
  {
    path: 'nearby-users',
    component: NearbyUsersComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }

];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
