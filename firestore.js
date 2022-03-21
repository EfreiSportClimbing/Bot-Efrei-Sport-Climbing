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
        .catch(() => console.log("failed to create user"))
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
        .catch(() => console.log("failed to remove user"))
});
}

module.exports = {addOne,removeOne}
