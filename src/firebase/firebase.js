import { initializeApp } from "@firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage, ref } from "@firebase/storage";
import * as data from "../../config.json" assert { type: "json" };

// Get the Firebase config from config.json
const { apiKey, authDomain, projectId, databaseURL, storageBucket, messagingSenderId, appId } = data.default.firebase;

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
const firebaseApp = initializeApp(firebaseConfig);
// Initialize Firestore
const firestore = getFirestore(firebaseApp);

// Initialize Storage
const storage = getStorage(firebaseApp);
const storageRef = ref(storage, "");

export { firestore, storage, storageRef };
