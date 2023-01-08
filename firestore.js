const { firestore } = require("./firebase");
require("firebase/firestore");
require("fs");

async function registerUser(user) {
    const doc = await firestore
        .collection("users")
        .doc(user.id)
        .get()
        .then((docRef) => docRef.data());
    if (doc) {
        throw new Error("Utilisateur déjà inscrit");
    }
    await firestore
        .collection("users")
        .doc(user.id)
        .set({
            promo: user.promo,
            firstname: user.firstname,
            lastname: user.lastname,
        })
        .then(() => console.log("user added"));
}

async function addOne(user) {
    await firestore
        .collection("users")
        .doc(user.id)
        .get()
        .then(async (docRef) => {
            await firestore
                .collection("users")
                .doc(user.id)
                .update({ nb_seance: parseInt(docRef.data().nb_seance) + 1 });
        })
        .catch(() => {
            throw new Error("Veuillez vous inscrire avec la commande /inscription");
        });
}

async function removeOne(user) {
    await firestore
        .collection("users")
        .doc(user.id)
        .get()
        .then(async (docRef) => {
            await firestore
                .collection("users")
                .doc(user.id)
                .update({
                    nb_seance:
                        parseInt(docRef.data().nb_seance) > 0
                            ? parseInt(docRef.data().nb_seance) - 1
                            : 0,
                });
        })
        .catch(() => {
            throw new Error("Veuillez vous inscrire avec la commande /inscription");
        });
}

async function getOne(user) {
    return await firestore
        .collection("users")
        .doc(user.id)
        .get()
        .then(async (docRef) => {
            return docRef.data().nb_seance;
        })
        .catch(() => {
            throw new Error("Veuillez vous inscrire avec la commande /inscription");
        });
}

async function getAll() {
    return await firestore
        .collection("users")
        .get()
        .then(async (docRef) => {
            const data = docRef.docs.map((doc) => doc.data());
            console.log(data);
            const today = new Date();
            const date =
                today.getDate() +
                "-" +
                (today.getMonth() + 1) +
                "-" +
                today.getFullYear();
            // write to a new file named `table${today}.txt`
            fs.writeFile(`table-${date}.txt`, data);
        })
        .catch(async () => {
            return [];
        });
}

module.exports = { addOne, removeOne, getOne, getAll, registerUser };
