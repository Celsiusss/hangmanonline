import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'hmo-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent {
  @Output() keyPress = new EventEmitter();
  @Input() wrongLetters: string[];

  keyboard = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  addLetter(letter: string) {
    this.wrongLetters = [...this.wrongLetters, letter];
    this.keyPress.emit(letter);
  }

}
