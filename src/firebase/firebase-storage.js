import { ref, listAll, getMetadata, updateMetadata } from "@firebase/storage";
import { storage, storageRef } from "./firebase.js";

const getFiles = async () => {
    const files = await listAll(storageRef);
    files.items.forEach(async (itemRef) => {
        // All the items under listRef.
        const { customMetadata } = await getMetadata(itemRef);
        await updateMetadata(itemRef, {
            customMetadata: {
                used: "true",
            },
        });
        const newMetadata = await getMetadata(itemRef);
        console.log("old :", customMetadata, "\nnew :", newMetadata.customMetadata);
    });
    return files.items;
};

const getNotUsedTicket = async () => {
    const res = await getFiles();
    for (let i = 0; i < res.length; i++) {
        const metadata = await res[i].getMetadata();
        console.log(metadata);
        if (!metadata.customMetadata) {
            return res[i];
        }
    }
};

var metadata = {
    customMetadata: {
        used: "true",
    },
};

const getNTickets = async () => {
    // in the db there were only tickets, get the first one that is not used and return it
    const ticket = await getNotUsedTicket();
    // get the url of the ticket
    const url = await ticket.getDownloadURL();
    // change the name of the file to used
    await ticket.updateMetadata(metadata);
    return url;
};

export { getFiles, getNTickets as getOneTicket };
