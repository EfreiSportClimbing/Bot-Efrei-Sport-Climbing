import { firestore } from "./firebase.js";
import { addDoc, collection, getDoc, doc, setDoc, updateDoc, getDocs, increment, runTransaction, arrayUnion } from "firebase/firestore";

async function registerOrder(order) {
    const docRef = doc(firestore, "orders", order.id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        throw new Error("Ordre déjà enregistré");
    }
    await setDoc(docRef, {
        date: order.date,
        filesUrl: arrayUnion(...order.filesUrl),
        userId: order.userId,
    });
}

async function getOrder(id) {
    const docRef = doc(firestore, "orders", id.toString());
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error("Ordre non trouvé");
    } else {
        Object.assign(order, docSnap.data());
        console.log(order);
        return order;
    }
}

async function orderExists(id) {
    const docRef = doc(firestore, "orders", id.toString());
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return false;
    } else {
        return true;
    }
}

export { registerOrder, getOrder, orderExists };
