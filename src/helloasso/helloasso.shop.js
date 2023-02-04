import * as data from "../../config.json" assert { type: "json" };
import { client } from "../index.js";
import { orderExists, registerOrder } from "../firebase/orders.firestore.js";
import { DiscordAPIError } from "discord.js";
import { getUnusedTicket } from "../firebase/firebase-storage.js";
import jszip from "jszip";
import { getBytes } from "@firebase/storage";
import { AttachmentBuilder } from "discord.js";

const { GUILD_ID } = data.default.discord;

export const checkClimbupOrder = async (order) => {
    // synchronous loop
    const ticketsUrl = [];
    const firstItem = order.items[0];

    const userId = firstItem?.customFields?.find((field) => field?.name === "Identifiant")?.answer;
    const guild = await client.guilds.fetch(GUILD_ID);

    try {
        var user = await guild.members.fetch(userId);
        if (!user.roles.cache.has("752444499795640360")) {
            // send a message to the user
            return await user.send("Vous n'avez pas le rôle adapté pour commander.");
        }
    } catch (error) {
        if (error instanceof DiscordAPIError) {
            return console.log("user not found in the guild.");
        } else {
            throw error;
        }
    }

    const file = new jszip();
    for (const item of order.items) {
        if (item?.state !== "Processed") {
            return;
        }
        const ticketRef = await getUnusedTicket(order.id);
        console.log(ticketRef.fullPath);
        ticketsUrl.push(ticketRef.fullPath);
        const bytes = await getBytes(ticketRef);
        file.file("ticket-" + item.id + ".pdf", bytes, { binary: true });
    }
    const orderData = {
        id: order.id,
        userId: userId,
        filesUrl: ticketsUrl,
        date: order.date,
    };
    const attachmentFile = new AttachmentBuilder(await file.generateAsync({ type: "nodebuffer" }), { name: "tickets.zip" });
    await registerOrder(orderData);
    // send tickets to the user
    await user.send({
        content: "Salut,\nVoici tes tickets ! ordre d'achat: " + order.id + "\nBonne grimpe !",
        files: [attachmentFile],
    });
};
