const {firestore} = require("./firebase");
require("firebase/firestore")

async function addOne (user) {
    await firestore.collection("users").doc(user.id).get()
    .then(async (docRef) => {
        await firestore.collection("users").doc(user.id).update({presence : parseInt(docRef.data().presence) +1})
    })
    .catch(async () => {
        await firestore.collection("users").doc(user.id).set(
            {
                presence:1,
                user: user.username
            }
        ).then(() => console.log("user created"))
});
}

async function removeOne (user) {
    await firestore.collection("users").doc(user.id).get()
    .then(async (docRef) => {
        await firestore.collection("users").doc(user.id).update({presence : parseInt(docRef.data().presence) -1})
    })
    .catch(async () => {
        await firestore.collection("users").doc(user.id).set(
            {
                presence:1,
                user: user.username
            }
        ).then(() => console.log("user created"))
});
}

module.exports = {addOne,removeOne}
