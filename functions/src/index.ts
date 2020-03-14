import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

require('cors')({ origin: true });

admin.initializeApp();

const words = ['dog', 'cat', 'carrot'];
const alphabet = [
    'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
    'z', 'x', 'c', 'v', 'b', 'n', 'm'
];

interface Player {
  uid: string;
  username: string;
}

export const submitLetter = functions.https.onCall(async (data, context) => {
  if (!context.auth || !data.gameId || !data.letter) {
    return 'missing auth, gameId or letter';
  }
    const { letter, gameId } = data;

    const doc = await admin.firestore().collection('games').doc(gameId).get();
    const game = doc.data();
    if (!game) {
        return 'game does not exist';
    }

    if (context.auth.uid !== game.nextPlayer) {
      return 'not your turn';
    }

    const unguessed: string[] = game.unguessed;
    const guessed: string[] = game.guessed;

    if (unguessed.includes(letter)) {
        const newUnguessed = unguessed.filter(char => char !== letter);
        guessed.push(letter);
        const correct = game.word.split('').map((char: string) => guessed.includes(char) ? char : null);
        const finished = !correct.some((char: string) => !char);

        await doc.ref.update({
            unguessed: newUnguessed,
            guessed,
            correct,
            nextPlayer: game.players[getNextPlayer(game.nextPlayer, game.players)].uid,
            status: finished ? 'intermission' : game.status,
            winner: finished ? context.auth.uid : ''
        });
        return 'ok';
    } else if (guessed.includes(letter)) {
        return 'letter already guessed';
    } else {
        return 'invalid character';
    }
});

export const createGame = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      return {
        gameId: null
      };
    }

    const user = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const username = user.exists ? (<any>user).data().username : 'Player';

    const word = words[Math.floor(Math.random() * words.length)];
    return admin.firestore().collection('games').add({
        word,
        unguessed: alphabet,
        guessed: [],
        correct: word.split('').map(char => null),
        players: [{ uid: context.auth.uid, username }],
        ingame: [],
        status: 'notstarted',
        starter: context.auth.uid,
        winner: ''
    })
      .then(game => ({
        gameId: game.id
      }));
});

export const startGame = functions.https.onCall(async (data, context) => {
  if (!context.auth || !data.gameId) {
    return 'missing auth or gameId';
  }
  const gameId: string = data.gameId;
  const doc = await admin.firestore().collection('games').doc(gameId).get();
  const game = doc.data();

  if (!game) {
    return 'game missing from db'
  }

  if (context.auth.uid !== game.starter) {
    return 'you did not start this game';
  }

  return newRound(gameId, context.auth.uid);
});

export const joinGame = functions.https.onCall(async (data, context) => {
  if (!context.auth || !data.gameId) {
    return 'missing auth or gameId';
  }
  const doc = await admin.firestore().collection('games').doc(data.gameId).get();
  const game = doc.data();

  if (!game) {
    return 'game missing from db'
  }

  const user = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const username = user.exists ? (<any>user).data().username : 'Player';

  if (game.players.map((player: Player) => player.uid).includes(context.auth.uid)) {
    return 'already in game';
  }

  return doc.ref.update({
    players: [...game.players, { uid: context.auth.uid, username }]
  });
});

export const guessWord = functions.https.onCall(async (data, context) => {
  if (!context.auth || !data.gameId) {
    return 'missing auth or gameId';
  }
  const {word, gameId} = data;
  if (!word) {
    return 'word is needed';
  }

  const doc = await admin.firestore().collection('games').doc(gameId).get();
  const game = doc.data();

  if (!game) {
    return 'game not found';
  }

  if (game.word.toLowerCase() === word.toLowerCase()) {
    return doc.ref.update({
      status: 'intermission',
      winner: context.auth.uid,
      correct: game.word.split('')
    });
  }
  return;
});

export const updateUsername = functions.https.onCall((data, context) => {
  if (!context.auth || !data.gameId || !data.username) {
    return 'missing auth or gameId';
  }
  const auth = context.auth;

  const usersRef = admin.firestore().collection('users').doc(context.auth.uid);
  const gameRef = admin.firestore().collection('games').doc(data.gameId);

  return admin.firestore().runTransaction(async transaction => {
    const gameDoc = await transaction.get(gameRef);

    const game = gameDoc.data();

    if (!game) {
      return;
    }

    const newPlayers = [...game.players];
    newPlayers.find(player => player.uid === auth.uid).username = data.username;

    return transaction
      .update(usersRef, { username: data.username })
      .update(gameRef, { players: newPlayers })
  })
});

export const newUser = functions.auth.user().onCreate((user, context) => {
  return admin.firestore().collection('users').doc(user.uid).set({
    username: user.displayName || 'Player'
  });
});


function newRound(gameId: string, userId: string) {
  const word = words[Math.floor(Math.random() * words.length)];
  const docRef = admin.firestore().collection('games').doc(gameId);

  return admin.firestore().runTransaction(async transaction => {
    const doc = await transaction.get(docRef);
    const gameData = doc.data();
    if (!doc.exists || !gameData) {
      throw new Error('game does not exist');
    }

    if (userId !== gameData.starter) {
      return 'not the owner of the game';
    }

    const nextPlayer = gameData.winner ? gameData.winner : gameData.players[0].uid;

    return transaction.update(docRef, {
      word,
      unguessed: alphabet,
      guessed: [],
      correct: word.split('').map(char => null),
      ingame: gameData.players.map((players: Player) => players.uid),
      initialized: true,
      winner: '',
      status: 'running',
      nextPlayer
    });
  });
}

function getNextPlayer(currentPlayer: string, players: Player[]) {
  const playerNum = players.map(player => player.uid).indexOf(currentPlayer) + 1;
  return playerNum === -1 ? 0 : (players.length -1) < playerNum ? 0 : playerNum;
}
