// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCnfZ4CjsAtWB7T-KVes6YRLPGVEWvyVKY',
    authDomain: 'hangmanonlineapp.firebaseapp.com',
    databaseURL: 'https://hangmanonlineapp.firebaseio.com',
    projectId: 'hangmanonlineapp',
    storageBucket: 'hangmanonlineapp.appspot.com',
    messagingSenderId: '748062864483',
    appId: '1:748062864483:web:e0d841f0d8088195b73456',
    measurementId: 'G-87ME1GGNCW'
  },
  functionsUrl: 'http://localhost:5001/hangmanonlineapp/us-central1'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
