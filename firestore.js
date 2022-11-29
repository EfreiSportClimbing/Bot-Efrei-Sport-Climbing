const { firestore } = require("./firebase");
require("firebase/firestore");
require("fs");

async function addOne(user) {
  await firestore
    .collection("users")
    .doc(user.id)
    .get()
    .then(async (docRef) => {
      await firestore
        .collection("users")
        .doc(user.id)
        .update({ presence: parseInt(docRef.data().presence) + 1 });
    })
    .catch(async () => {
      await firestore
        .collection("users")
        .doc(user.id)
        .set({
          presence: 1,
          user: user.username,
        })
        .then(() => console.log("user created"))
        .catch(() => console.log("failed to remove user"));
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
        .update({ presence: parseInt(docRef.data().presence) - 1 });
    })
    .catch(async () => {
      await firestore
        .collection("users")
        .doc(user.id)
        .set({
          presence: 0,
          user: user.username,
        })
        .then(() => console.log("user created"))
        .catch(() => console.log("failed to remove user"));
    });
}

async function getOne(user) {
  return await firestore
    .collection("users")
    .doc(user.id)
    .get()
    .then(async (docRef) => {
      return docRef.data().presence;
    })
    .catch(async () => {
      await firestore
        .collection("users")
        .doc(user.id)
        .set({
          presence: 0,
          user: user.username,
        })
        .then(() => 0);
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

module.exports = { addOne, removeOne, getOne, getAll };
