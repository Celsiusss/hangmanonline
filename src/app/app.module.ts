import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { KeyboardComponent } from './game/keyboard/keyboard.component';
import { DisplayComponent } from './game/display/display.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';
import { ORIGIN } from '@angular/fire/functions';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';

const PROVIDERS = [
  {
    provide: ORIGIN,
    useValue: environment.production
      ? 'https://hangmanonlineapp.web.app'
      : 'http://localhost:5001'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    KeyboardComponent,
    DisplayComponent,
    DisplayComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: PROVIDERS,
  bootstrap: [AppComponent]
})
export class AppModule {}
