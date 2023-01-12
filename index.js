import { Low } from "lowdb";
import Datastore from "nedb-promises";
import { JSONFile } from "lowdb/node";
import { Client, GatewayIntentBits, EmbedBuilder, Partials, ButtonBuilder, ActionRowBuilder } from "discord.js";
import cron from "cron";
import { addOne, removeOne, getOne, registerUser, getUser } from "./firestore.js";
import * as data from "./config.json" assert { type: "json" };

// get config file
const { token, guildId, clientId } = data.default;

// config database file
const db = new Datastore({ filename: "./data/cache.db", autoload: true });

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// When the client is ready, run this code (only once)
const channels = [
    { name: "antreblock", channelId: "955472985735721010" },
    { name: "arkose", channelId: "955473048444756048" },
    { name: "climb-up", channelId: "955473017746628628" },
    { name: "vertical-art", channelId: "955473088005431396" },
    { name: "climb-up-bordeaux", channelId: "1022523538986508360" },
    { name: "annonces", channelId: "755109496182931476" },
];

const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const sendMessages = () => {
    channels.forEach(async (channel) => {
        const embed = new EmbedBuilder()
            .setTitle(`${channel.name}`)
            .setColor("GOLD")
            .setDescription(`Horaires prévus à ${channel.name}`)
            .setThumbnail("https://cdn.discordapp.com/attachments/934805065745715243/934823576807280700/Logo_ESC.png");
        const guild = client.guilds.cache.get(guildId);
        const chan = guild.channels.cache.get(channel.channelId);
        await chan.send({ embeds: [embed] });
    });
};

const updateMessages = () => {
    channels.forEach(async (channel) => {
        const channelInstance = client.channels.cache.get(channel.channelId);
        const message = await channelInstance.messages.fetch(channel.channelEmbedId);
        const embed = message.embeds[0];
        const newEmbed = new EmbedBuilder(embed);
        newEmbed
            .setTitle(`${channel.name}`)
            .setColor("Gold")
            .setDescription(`Horaires prévus à ${channel.name}`)
            .setThumbnail("https://cdn.discordapp.com/attachments/934805065745715243/934823576807280700/Logo_ESC.png");
        message.edit({ embeds: [newEmbed] });
    });
};

const deleteSceance = (day) => {
    channels.forEach(async (channel) => {
        const guild = client.guilds.cache.get(guildId);
        const chan = guild.channels.cache.get(channel.channelId);
        const message = await chan.messages.fetch(channel.channelEmbedId);
        const embed = message.embeds[0];
        let fields = embed.fields;
        fields = fields.filter((field) => !field.name.includes(day));
        embed.fields = fields;
        await message.edit({ embeds: [embed] });
    });
};

client.once("ready", () => {
    console.log("Ready!");
    //sendMessages()
    //updateMessages();
    let deleteMonday = new cron.CronJob(
        "0 0 0 * * 2",
        () => {
            deleteSceance("lundi");
        },
        null,
        true,
        "Europe/Paris"
    );
    let deleteTuesday = new cron.CronJob(
        "0 0 0 * * 3",
        () => {
            deleteSceance("mardi");
        },
        null,
        true,
        "Europe/Paris"
    );
    let deleteWednesday = new cron.CronJob(
        "0 0 0 * * 4",
        () => {
            deleteSceance("mercredi");
        },
        null,
        true,
        "Europe/Paris"
    );
    let deleteThursday = new cron.CronJob(
        "0 0 0 * * 5",
        () => {
            deleteSceance("jeudi");
        },
        null,
        true,
        "Europe/Paris"
    );
    let deleteFriday = new cron.CronJob(
        "0 0 0 * * 6",
        () => {
            deleteSceance("vendredi");
        },
        null,
        true,
        "Europe/Paris"
    );
    let deleteSaturday = new cron.CronJob(
        "0 0 0 * * 0",
        () => {
            deleteSceance("samedi");
        },
        null,
        true,
        "Europe/Paris"
    );
    let deleteSunday = new cron.CronJob(
        "0 0 0 * * 1",
        () => {
            deleteSceance("dimanche");
        },
        null,
        true,
        "Europe/Paris"
    );
    deleteMonday.start();
    deleteTuesday.start();
    deleteWednesday.start();
    deleteThursday.start();
    deleteFriday.start();
    deleteSaturday.start();
    deleteSunday.start();
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        // If the interaction is a slash command
        const { commandName } = interaction;
        // check the role of the user
        if (!interaction.member.roles.cache.has("752444499795640360") && !interaction.member.roles.cache.has("1032031670964072650")) {
            return interaction.reply({
                content: `Vous avez besoin du role <@&752444499795640360> ou <@&1032031670964072650> pour utiliser le bot.`,
                ephemeral: true,
            });
        }
        if (commandName === "séance") {
            //get user info
            try {
                var user = await getUser(interaction.user);
            } catch (error) {
                return interaction.reply({
                    content: error.message,
                    ephemeral: true,
                });
            }
            //get commamd info
            const salle = interaction.options.getString("salle");
            const day = interaction.options.getString("date");
            const heure = interaction.options.getString("heure");

            //generate date from command
            const date = new Date();

            var daytoset = days.indexOf(day);
            var currentDay = date.getDay();
            var distance = (daytoset + 7 - currentDay) % 7;
            date.setDate(date.getDate() + distance);

            var hour = heure.split("h")[0];
            date.setHours(hour);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            //check if we already have a session at this time
            const session = await db.findOne({ date: date, salle: salle });
            if (session) {
                if (session.participants.includes(interaction.user.id)) {
                    return interaction.reply({
                        content: `Vous êtes déjà inscrit à cette séance.`,
                        ephemeral: true,
                    });
                }
                // update database
                db.updateOne({ _id: session._id }, { $addToSet: { participants: interaction.user.id } });

                // update message
                const messageChanel = channels.find((channel) => channel.name === salle);
                const channelInstance = client.channels.cache.get("856166037913600081" || messageChanel.channelId); // TODO: remove hardcoded channel
                const message = await channelInstance.messages.fetch(session._id);
                const embed = message.embeds[0];
                const newEmbed = new EmbedBuilder(embed.data);
                const field = newEmbed.data.fields?.find((field) => field.name.includes("Participants"));
                if (field) {
                    try {
                        // get user info
                        const user = await getUser(interaction.user);
                        field.value += `\n- ${user.firstname} ${user.lastname}`;
                        // update database
                        db.updateOne({ _id: session._id }, { $push: { participants: interaction.user.id } });

                        await addOne(interaction.user);
                        message.edit({ embeds: [newEmbed] });
                        return interaction.reply({ content: `Vous avez été ajouté à la séance.`, ephemeral: true });
                    } catch (error) {
                        return interaction.reply({
                            content: error.message,
                            ephemeral: true,
                        });
                    }
                }
            }

            //create embed
            const embed = new EmbedBuilder();
            embed.setAuthor({
                name: user.firstname,
                iconURL: interaction.user.avatarURL(),
                url: "https://discord.com/users/" + interaction.user.id,
            });
            embed.setTitle(
                date.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                })
            );
            embed.setDescription(`Séance de grimpe à **${interaction.options.getString("salle")}**.`);
            embed.addFields({
                name: "Participants :",
                value: "- " + user.firstname + " " + user.lastname,
                inline: false,
            });
            embed.setColor("Gold");
            // add button
            const button1 = new ButtonBuilder();
            button1.setCustomId("join");
            button1.setLabel("Rejoindre");
            button1.setStyle("Primary");
            const button2 = new ButtonBuilder();
            button2.setCustomId("leave");
            button2.setLabel("Se désinscrire");
            button2.setStyle("Danger");

            // send message
            const messageChanel = channels.find((channel) => channel.name === salle);
            const channelInstance = client.channels.cache.get("856166037913600081" || messageChanel.channelId); // TODO: remove hardcoded channel
            var messageId = await channelInstance
                .send({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents([button1, button2])],
                })
                .then((embedMessage) => embedMessage.id);
            const doc = { _id: messageId, participants: [interaction.user.id], date: date, salle: salle };
            await db.insert(doc);
            await interaction.reply(`Ajout d'une séance à **${salle}** le **${day}** à **${heure}h**`);
        } else if (commandName === "activité") {
            try {
                const activite = await getOne(interaction.user);
                console.log(activite);
                if (activite) {
                    interaction.reply({
                        content: `Vous vous êtes inscrits à ${activite} séances`,
                        ephemeral: true,
                    });
                    return;
                }
                return interaction.reply({
                    content: "Vous n'êtes inscrit à aucune séance",
                    ephemeral: true,
                });
            } catch (error) {
                return interaction.reply({
                    content: error.message,
                    ephemeral: true,
                });
            }
        } else if (commandName === "désinscrire") {
            const salle = interaction.options.getString("salle");
            const date = interaction.options.getString("date");
            const heure = interaction.options.getString("heure");
            const messageChanel = channels.find((channel) => channel.name === salle);
            const channelInstance = client.channels.cache.get(messageChanel.channelId);
            const message = await channelInstance.messages.fetch(messageChanel.channelEmbedId);
            const embed = message.embeds[0];
            const user = interaction.user.username;

            const newEmbed = new EmbedBuilder(embed.data);
            const field = newEmbed.data.fields?.find((field) => field.name === `**${date}** **${heure}h**`);
            if (field) {
                if (!field.value.includes(user)) {
                    return interaction.reply({
                        content: "Vous n'êtes pas inscrit à cette séance",
                        ephemeral: true,
                    });
                }
                field.value = field.value.replace(`, *${user}*`, "");
                field.value = field.value.replace(`*${user}*`, "");
                if (field.value.length === 0) {
                    newEmbed.data.fields = newEmbed.data.fields.filter((field) => field.name !== `**${date}** **${heure}h**`);
                } else {
                    newEmbed.data.fields = [newEmbed.data.fields.filter((field) => field.name !== `**${date}** **${heure}h**`), field];
                }
            } else {
                return interaction.reply({
                    content: "Vous n'êtes pas inscrit à cette séance",
                    ephemeral: true,
                });
            }
            // replace the fields in newEmbed with the new fields
            try {
                await removeOne(interaction.user);
                message.edit({ embeds: [newEmbed] });
                await interaction.reply({
                    content: `Suppression d'une séance à **${salle}** le **${date}** à **${heure}h**`,
                    ephemeral: true,
                });
            } catch (error) {
                await interaction.reply({
                    content: error.message,
                    ephemeral: true,
                });
            }
        } else if (commandName === "inscription") {
            const myUser = {
                ...interaction.user,
                lastname: interaction.options.getString("nom"),
                firstname: interaction.options.getString("prénom"),
                promo: interaction.options.getString("promo"),
            };
            try {
                await registerUser(myUser);
                return interaction.reply({
                    content: `Inscription réussie !`,
                    ephemeral: true,
                });
            } catch (error) {
                return interaction.reply({
                    content: error.message,
                    ephemeral: true,
                });
            }
        }
    } else if (interaction.isButton()) {
        // if the interaction is a button
        const buttonId = interaction.customId;
        const message = interaction.message;
        const embed = message.embeds[0];

        if (buttonId == "join") {
            const séance = await db.findOne({ salle: "antreblock" });
            const newEmbed = new EmbedBuilder(embed.data);
            const field = newEmbed.data.fields?.find((field) => field.name.includes("Participants"));

            // check if the user is already in the participants list
            if (séance.participants.includes(interaction.user.id)) {
                return interaction.reply({
                    content: "Vous êtes déjà inscrit à cette séance",
                    ephemeral: true,
                });
            } else if (field) {
                // update embed
                try {
                    // get user info
                    const user = await getUser(interaction.user);
                    field.value += `\n- ${user.firstname} ${user.lastname}`;
                    // update database
                    db.updateOne({ _id: séance._id }, { $push: { participants: interaction.user.id } });

                    await addOne(interaction.user);
                    message.edit({ embeds: [newEmbed] });
                    await interaction.reply({ content: `Vous avez été ajouté à la séance.`, ephemeral: true });
                } catch (error) {
                    return interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
            }
        } else if (buttonId == "leave") {
            const séance = await db.findOne({ salle: "antreblock" });
            const newEmbed = new EmbedBuilder(embed.data);
            const field = newEmbed.data.fields?.find((field) => field.name.includes("Participants"));

            // check if the user is already in the participants list
            if (!séance.participants.includes(interaction.user.id)) {
                return interaction.reply({
                    content: "Vous n'êtes pas inscrit à cette séance",
                    ephemeral: true,
                });
            } else if (field) {
                // update embed
                try {
                    // get user info
                    const user = await getUser(interaction.user);
                    field.value = field.value.replace(`- ${user.firstname} ${user.lastname}`, "");
                    // update database
                    db.updateOne({ _id: séance._id }, { $pull: { participants: interaction.user.id } });

                    await removeOne(interaction.user);

                    if (séance.participants.length === 1) {
                        db.deleteOne({ _id: séance._id });
                        await message.delete();
                    } else {
                        message.edit({ embeds: [newEmbed] });
                    }
                    await interaction.reply({ content: `Vous avez été retiré de la séance.`, ephemeral: true });
                } catch (error) {
                    return interaction.reply({
                        content: error.message,
                        ephemeral: true,
                    });
                }
            }
        }
    }
});

client.login(token);
