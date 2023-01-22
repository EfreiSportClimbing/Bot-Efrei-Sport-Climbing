import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as data from "./config.json" assert { type: "json" };
const { clientId, guildId, token } = data.default;

const commands = [
    new SlashCommandBuilder()
        .setName("séance")
        .setDescription("Créer une nouvelle scéance")
        .addStringOption((option) =>
            option
                .setName("salle")
                .setRequired(true)
                .setDescription("Salle de la scéance")
                .addChoices(
                    { name: "Antrebloc", value: "antrebloc" },
                    { name: "Arkose", value: "arkose" },
                    { name: "Climb-up", value: "climb-up" },
                    { name: "Vertical-art", value: "vertical-art" },
                    { name: "Climb-up (Bordeaux)", value: "climb-up-bordeaux" }
                )
        )
        .addStringOption((option) =>
            option
                .setName("date")
                .setRequired(true)
                .setDescription("Jour de la semaine")
                .addChoices(
                    { name: "Lundi", value: "lundi" },
                    { name: "Mardi", value: "mardi" },
                    { name: "Mercredi", value: "mercredi" },
                    { name: "Jeudi", value: "jeudi" },
                    { name: "Vendredi", value: "vendredi" },
                    { name: "Samedi", value: "samedi" },
                    { name: "Dimanche", value: "dimanche" }
                )
        )
        .addStringOption((option) =>
            option
                .setName("heure")
                .setRequired(true)
                .setDescription("Heure de début")
                .addChoices(
                    { name: "8h", value: "8" },
                    { name: "9h", value: "9" },
                    { name: "10h", value: "10" },
                    { name: "11h", value: "11" },
                    { name: "12h", value: "12" },
                    { name: "13h", value: "13" },
                    { name: "14h", value: "14" },
                    { name: "15h", value: "15" },
                    { name: "16h", value: "16" },
                    { name: "17h", value: "17" },
                    { name: "18h", value: "18" },
                    { name: "19h", value: "19" },
                    { name: "20h", value: "20" },
                    { name: "21h", value: "21" }
                )
        ),
    new SlashCommandBuilder().setName("activité").setDescription("Savoir son nombre de séances"),
    new SlashCommandBuilder()
        .setName("inscription")
        .setDescription("S'inscrire dans la base de donnée")
        .addStringOption((option) => option.setName("nom").setRequired(true).setDescription("Nom de famille"))
        .addStringOption((option) => option.setName("prénom").setRequired(true).setDescription("Prénom"))
        .addStringOption((option) =>
            option
                .setName("promo")
                .setRequired(true)
                .setDescription("Promotion")
                .addChoices({ name: "2023", value: "2023" }, { name: "2024", value: "2024" }, { name: "2025", value: "2025" }, { name: "2026", value: "2026" }, { name: "2027", value: "2027" })
        ),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);
