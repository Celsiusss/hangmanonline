import { Component } from '@angular/core';
import {GameService} from '../game/game.service';
import {Router} from '@angular/router';

@Component({
  selector: 'hmo-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(public gameService: GameService, private router: Router) { }

  async newGame() {
    const gameId = await this.gameService.createGame();
    await this.router.navigate(['game', gameId]);
    this.gameService.join(gameId);
  }

}
