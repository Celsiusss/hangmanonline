import { Component, Input } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'hmo-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent {
  constructor(public gameService: GameService) {}
}
