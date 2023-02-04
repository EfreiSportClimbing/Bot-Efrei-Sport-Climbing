import { ref, listAll, getMetadata, updateMetadata } from "@firebase/storage";
import { storage, storageRef } from "./firebase.js";

const getFilesRef = async () => {
    const files = await listAll(storageRef);
    return files.items;
};

const getUnusedTicket = async (orderId) => {
    const filesRef = await getFilesRef();
    for (const fileRef of filesRef) {
        const metadata = await getMetadata(fileRef);
        if (!metadata.customMetadata?.id) {
            await updateMetadata(fileRef, { customMetadata: { id: orderId } });
            return fileRef;
        }
    }
    throw new Error("Pas assez de tickets disponibles");
};

const resetMetadata = async () => {
    const filesRef = await getFilesRef();
    filesRef.forEach(async (fileRef) => {
        await updateMetadata(fileRef, { customMetadata: null });
    });
};

const getNTickets = async () => {
    // in the db there were only tickets, get the first one that is not used and return it
    const ticket = await getUnusedTickets();
    // get the url of the ticket
    const url = await ticket.getDownloadURL();
    // change the name of the file to used
    await ticket.updateMetadata(metadata);
    return url;
};

export { getFilesRef, getUnusedTicket };
