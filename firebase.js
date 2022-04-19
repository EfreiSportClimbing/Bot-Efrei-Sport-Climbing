const firebase = require('firebase');
require('firebase/firestore');
const {apiKey, authDomain, projectId, databaseURL, storageBucket, messagingSenderId, appId} = require('./config.json');
// Required for side-effects

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    databaseURL: databaseURL,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId
};

// Initialize Firebase
if (!firebase.apps.length) {
    const firebaseApp = firebase.initializeApp(firebaseConfig);
}
let firestore = firebase.firestore();

module.exports = {firestore};
