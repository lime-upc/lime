import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';

import { AuthenticationService } from '../services/AuthenticationService';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { RegisterPage } from '../pages/register/register';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { Storage } from '@ionic/storage';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {AuthConfig, AuthHttp} from "angular2-jwt";
import {Http} from "@angular/http";
import {ProfilePage} from "../pages/profile/profile";
import {EditProfilePage} from "../pages/profile/edit/edit";
import {StaticDataService} from "../services/preferences";
import {GoogleMaps} from "@ionic-native/google-maps";
import {LoadingPage} from "../pages/loading/loading";

let storage = new Storage({});

export function getAuthHttp(http) {
  return new AuthHttp(new AuthConfig({
    headerPrefix: 'jwt',
    noJwtError: true,
    globalHeaders: [{'Accept': 'application/json'}],
    tokenGetter: (() =>  storage.get('jwt').then((token: string) => token)),
  }), http);
}


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    RegisterPage,
    LoginPage,
    MapPage,
    ProfilePage,
    EditProfilePage,
    LoadingPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    HttpModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    RegisterPage,
    LoginPage,
    MapPage,
    ProfilePage,
    EditProfilePage,
    LoadingPage
  ],
  providers: [
    StatusBar,
    GoogleMaps,
    SplashScreen,
    AuthenticationService,
    StaticDataService,
    {
      provide: AuthHttp,
      useFactory: getAuthHttp,
      deps: [Http]
    },
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
