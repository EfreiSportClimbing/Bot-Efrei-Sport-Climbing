import firebase from "firebase";
import * as data from "../../config.json" assert { type: "json" };

const { apiKey, authDomain, projectId, databaseURL, storageBucket, messagingSenderId, appId } = data.default.firebase;
// Required for side-effects

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    databaseURL: databaseURL,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
};

// Initialize Firebase
if (!firebase.apps.length) {
    const firebaseApp = firebase.initializeApp(firebaseConfig);
}
let firestore = firebase.firestore();

const storage = firebase.storage();
var storageRef = storage.ref();

export { firestore, storage, storageRef };
