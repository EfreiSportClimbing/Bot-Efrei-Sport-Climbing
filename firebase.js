const firebase = require("firebase");
require("firebase/firestore")
// Required for side-effects

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPRJCKBi_saRBf4KkCMUMcfn8hRcG0Erw",
  authDomain: "efrei-sport-climbing-s-bot.firebaseapp.com",
  projectId: "efrei-sport-climbing-s-bot",
  databaseURL: "https://efrei-sport-climbing-s-bot.firebaseio.com",
  storageBucket: "efrei-sport-climbing-s-bot.appspot.com",
  messagingSenderId: "965127462755",
  appId: "1:965127462755:web:65ea364c223b760296fd56"
};

// Initialize Firebase
if (!firebase.apps.length) {
    const firebaseApp = firebase.initializeApp(firebaseConfig);
}
var firestore = firebase.firestore();

module.exports = {firestore}