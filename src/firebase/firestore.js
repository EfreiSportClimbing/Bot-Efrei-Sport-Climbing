import { EmbedAssertions } from "discord.js";
import { firestore } from "./firebase.js";
import { addDoc, collection, getDoc, doc, setDoc, updateDoc, getDocs, increment, runTransaction } from "firebase/firestore";

async function registerUser(user) {
    const docRef = doc(firestore, "users", user.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        throw new Error("Utilisateur déjà inscrit");
    }
    await setDoc(docRef, {
        promo: user.promo,
        firstname: user.firstname,
        lastname: user.lastname,
        nb_seance: 0,
    });
}

async function addOne(user) {
    const docRef = doc(firestore, "users", user.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error("Veuillez vous inscrire avec la commande /inscription");
    } else {
        await updateDoc(docRef, {
            nb_seance: increment(1),
        });
    }
}

async function removeOne(user) {
    const docRef = doc(firestore, "users", user.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error("Veuillez vous inscrire avec la commande /inscription");
    } else {
        await updateDoc(docRef, {
            nb_seance: increment(-1),
        });
    }
}

async function getUser(user) {
    const docRef = doc(firestore, "users", user.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error("Veuillez vous inscrire avec la commande /inscription");
    } else {
        Object.assign(user, docSnap.data());
        console.log(user);
        return user;
    }
}

async function getOne(user) {
    const docRef = doc(firestore, "users", user.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error("Veuillez vous inscrire avec la commande /inscription");
    } else {
        return docSnap.data().nb_seance;
    }
}

async function getAll() {
    const collectionRef = collection(firestore, "users");
    return getDocs(collectionRef)
        .then((querySnapshot) => querySnapshot.map((doc) => doc.data()))
        .catch((error) => {
            console.log("Error getting documents: ", error);
            return [];
        });
}

async function resetAll() {
    const collectionRef = collection(firestore, "users");
    // update all documents in the collection
    runTransaction(firestore, async (transaction) => {
        const querySnapshot = await getDocs(collectionRef);
        querySnapshot.forEach((doc) => {
            transaction.update(doc.ref, { nb_seance: 0 });
        });
    }).catch((error) => {
        console.log("Transaction failed: ", error);
    });
}

export { addOne, removeOne, getOne, registerUser, getUser, getAll, resetAll };
