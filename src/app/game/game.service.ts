import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import 'firebase/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { exhaustMap, map } from 'rxjs/operators';

type Status = 'notstarted' | 'intermission' | 'running';

interface Game {
  guessed: string[];
  correct: (string | null)[];
  starter: string;
  initialized: boolean;
  status: Status;
  winner: string;
  players: Player[];
  nextPlayer: string;
}

interface Player {
  uid: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gameId;
  players: Player[] = [];
  characters: string[] = [];
  guessed: string[] = [];
  starter: string;
  initialized = false;
  status: Status = 'notstarted';
  winner: Player;
  countdown = 10;
  timerIsOn = false;
  userId = '';
  nextPlayer: Player = { uid: '', username: '' };

  private sub: Subscription;

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient,
    private fns: AngularFireFunctions,
    private afAuth: AngularFireAuth
  ) {}

  async createGame() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    const callable = this.fns.httpsCallable('createGame');
    const data = await callable({}).toPromise();
    this.gameId = data.gameId;
    return data.gameId;
  }

  async startGame() {
    const callable = this.fns.httpsCallable('startGame');
    await callable({ gameId: this.gameId }).toPromise();
  }

  async join(gameId: string) {
    if (!gameId) {
      throw new Error('gameId required');
    }
    this.gameId = gameId;
    const user = await this.afAuth.currentUser;

    const callable = this.fns.httpsCallable('joinGame');
    await callable({ gameId: this.gameId }).toPromise();

    this.sub = this.firestore
      .collection('games')
      .doc<Game>(this.gameId)
      .valueChanges()
      .subscribe((values) => {
        this.userId = user.uid;
        this.characters = values.correct.map((char) => (!char ? ' ' : char));
        this.guessed = values.guessed;
        this.starter = values.starter;
        this.initialized = values.initialized;
        this.status = values.status;
        this.winner = this.players.find(
          (player) => player.uid === values.winner
        );
        this.players = values.players;
        this.nextPlayer = this.players.find(
          (player) => player.uid === values.nextPlayer
        );

        if (this.timerIsOn && values.status === 'running') {
          this.timerIsOn = false;
          this.countdown = 10;
        }

        if (values.winner && values.status === 'intermission') {
          this.doTimer();
        }
      });
  }

  async submitLetter(letter: string) {
    if (this.status !== 'running') {
      return;
    }
    const callable = this.fns.httpsCallable('submitLetter');
    await callable({ gameId: this.gameId, letter }).toPromise();
  }

  private doTimer() {
    if (this.timerIsOn) {
      return;
    }
    this.timerIsOn = true;

    const countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown -= 1;
      }
    }, 1000);

    setTimeout(async () => {
      clearInterval(countdownInterval);
      if (this.userId === this.starter) {
        await this.startGame();
        this.join(this.gameId);
      }
    }, 10000);
  }

  async submitWord(word: string) {
    const callable = this.fns.httpsCallable('guessWord');
    await callable({ gameId: this.gameId, word }).toPromise();
  }

  async updateUsername(username: string) {
    const callable = this.fns.httpsCallable('updateUsername');
    await callable({ gameId: this.gameId, username }).toPromise();
  }
}
