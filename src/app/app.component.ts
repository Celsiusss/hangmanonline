import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'hmo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthed = false;
  constructor(private afAuth: AngularFireAuth) {}

  async ngOnInit() {
    try {
      await this.afAuth.signInAnonymously();
      this.isAuthed = true;
    } catch (e) {}
  }
}
