import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { GameService } from './game.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'hmo-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  constructor(
    public afAuth: AngularFireAuth,
    public gameService: GameService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const gameId = this.route.snapshot.params.id;
    this.gameService.join(gameId);
  }

  onKeyPress(char: string) {
    this.gameService.submitLetter(char);
  }
}
