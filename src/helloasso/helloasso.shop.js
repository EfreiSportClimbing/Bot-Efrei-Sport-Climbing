import * as data from "../../config.json" assert { type: "json" };
import { client } from "../index.js";
import { orderExists, registerOrder } from "../firebase/orders.firestore.js";
import { DiscordAPIError } from "discord.js";

const { GUILD_ID } = data.default.discord;

export const checkClimbupOrder = async (order) => {
    // synchronous loop
    for (const item of order.items) {
        if (item?.state !== "Processed") {
            return;
        }

        const userId = item?.customFields?.find((field) => field?.name === "Identifiant")?.answer;
        const guild = await client.guilds.fetch(GUILD_ID);

        try {
            const user = await guild.members.fetch(userId);
            if (user.roles.cache.has("752444499795640360")) {
                const orderData = {
                    id: order.id,
                    date: order.date,
                    filesUrl: ["1", "2", "3"],
                    userId: userId,
                };
                await registerOrder(orderData);
                await user.send(`Votre commande ${orderData.id} à la date de ${orderData.date} vient d'être traitée.`);
            } else {
                // send a message to the user
                await user.send("Vous n'avez pas le rôle adapté pour commander.");
            }
        } catch (error) {
            if (error instanceof DiscordAPIError) {
                console.log("user not found in the guild.");
            } else {
                throw error;
            }
        }
    }
};
