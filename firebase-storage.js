import { mergeDefault } from "discord.js";
import { storage, storageRef } from "./firebase.js";

const getFiles = async () => {
  const listRef = storageRef.child("");
  const res = await listRef.listAll();
  return res.items;
};

const getNotUsedTicket = async () => {
  const res = await getFiles();
  for(let i=0;i<res.length;i++){
    const metadata = await res[i].getMetadata();
    console.log(metadata)
    if(!metadata.customMetadata){
      return res[i]
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

