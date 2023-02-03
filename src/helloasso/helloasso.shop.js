import * as data from "../../config.json" assert { type: "json" };
import { client } from "../index.js";

const { GUILD_ID } = data.default.discord;

export const checkClimbupOrder = async (order) => {
    order.items.forEach(async (item) => {
        console.log("item :", item.id, item?.user, item?.customFields);

        if (item?.state !== "Processed") {
            console.log("item not processed");
            return false;
        }

        const userId = item?.customFields?.find((field) => field?.name === "Identifiant")?.answer;
        const guild = await client.guilds.fetch(GUILD_ID);

        try {
            const user = await guild.members.fetch(userId);

            if (user.roles.cache.has("752444499795640360")) {
                // send a message to the user
                console.log("user has the role");
                await user.send("Votre commande a été traitée");
            } else {
                // send a message to the user
                await user.send("Vous n'avez pas le rôle adapté");
            }
        } catch (error) {
            console.log("user not found");
            return false;
        }
    });
    return false;
};
