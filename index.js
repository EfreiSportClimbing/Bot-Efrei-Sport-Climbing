import Datastore from "nedb-promises";
import { Client, GatewayIntentBits, EmbedBuilder, Partials, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } from "discord.js";
import cron from "cron";
import { addOne, removeOne, getOne, registerUser, getUser } from "./firestore.js";
import * as data from "./config.json" assert { type: "json" };
import * as http from "http";
import * as fs from "fs";
import ical from "ical-generator";

// get config file
const { token, guildId, globalIp, host, port } = data.default;

const calendar = ical({ domain: host, name: "Efrei Sport Climbing" });
calendar.source("http://localhost/data/calendar.ical");
calendar.url("http://localhost/data/calendar.ical");
calendar.ttl(60);
calendar.timezone("Europe/Paris");

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

const deleteSceances = () => {
    const séances = db.find({
        time: { $lt: new Date() },
    });
    séances.forEach(async (séance) => {
        const channelId = channels.find((channel) => channel.name === séance.channel).channelId;
        const channel = client.channels.cache.get(channelId);
        const message = channel.messages.fetch(séance.messageId);
        message.delete();
        await db.remove({ _id: séance._id });
    });
};

const generateDate = (day, hour) => {
    //generate date from command
    const date = new Date();

    var daytoset = days.indexOf(day);
    var currentDay = date.getDay();
    var distance = (daytoset + 7 - currentDay) % 7;
    date.setDate(date.getDate() + distance);

    hour = hour.split("h")[0];
    date.setHours(hour);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
};

const createEvent = (salle, date, user, channelId, messageId) => {
    const event = calendar.createEvent({
        start: date,
        end: new Date(date.getTime() + 2 * 60 * 60 * 1000),
        summary: `Séance à ${salle}`,
        description: `Séance à ${salle} organisé par ${user.firstname} ${user.lastname}`,
        location: salle,
        url: "https://discord.com/channels/" + guildId + "/" + channelId + "/" + messageId,
    });
    event.createAttendee({ name: user.firstname + " " + user.lastname, email: "noreply@esc.fr" });
};

const addUserToEvent = (salle, date, user) => {
    const event = calendar.events().find((event) => event.location().title === salle && event.start().getTime() === date.getTime());
    if (event) {
        event.createAttendee({ name: user.firstname + " " + user.lastname, email: "noreply@esc.fr" });
    }
};

const removeUserFromEvent = (salle, date, user) => {
    const event = calendar.events().find((event) => {
        return event.location().title === salle && event.start().getTime() === date.getTime();
    });
    if (event) {
        const attendees = event.attendees().filter((attendee) => attendee.name() !== user.firstname + " " + user.lastname);
        if (attendees.length === 0) {
            const events = calendar.events().filter((event) => event.location().title !== salle && event.start().getTime() !== date.getTime());
            calendar.data.events = events;
        } else {
            event.data.attendees = attendees;
        }
    }
};

const loadCalendar = async () => {
    const séances = await db.find({});
    séances.forEach(async (séance) => {
        const user = await getUser(await client.guilds.cache.get(guildId).members.fetch(séance.participants[0]));
        const channel = channels.find((channel) => channel.name === séance.salle).channelId;
        createEvent(séance.salle, séance.date, user, channel, séance._id);
        séance.participants.forEach(async (participantId, index) => {
            if (index !== 0) {
                const user = await getUser(await client.guilds.cache.get(guildId).members.fetch(participantId));
                addUserToEvent(séance.salle, séance.date, user);
            }
        });
    });
};

client.once("ready", async () => {
    console.log("Ready!");
    await loadCalendar();
    let deleteDay = new cron.CronJob(
        "0 0 0 * * *",
        () => {
            deleteSceances();
        },
        null,
        true,
        "Europe/Paris"
    );
    deleteDay.start();
});

client.on("interactionCreate", async (interaction) => {
    // check the role of the user
    if (!interaction.member.roles.cache.has("752444499795640360") && !interaction.member.roles.cache.has("1032031670964072650")) {
        return interaction.reply({
            content: `Vous avez besoin du role <@&752444499795640360> ou <@&1032031670964072650> pour utiliser le bot.`,
            ephemeral: true,
        });
    }
    //get user info
    try {
        var user = await getUser(interaction.user);
    } catch (error) {
        return interaction.reply({
            content: error.message,
            ephemeral: true,
        });
    }
    if (interaction.isCommand()) {
        // If the interaction is a slash command
        const { commandName } = interaction;
        if (commandName === "séance") {
            //get commamd info
            const salle = interaction.options.getString("salle");
            const day = interaction.options.getString("date");
            const heure = interaction.options.getString("heure");

            //generate date from command
            const date = generateDate(day, heure);

            //check if we already have a session at this time
            const session = await db.findOne({ date: date, salle: salle });
            if (session) {
                // check if user is already registered
                if (session.participants.includes(interaction.user.id)) {
                    return interaction.reply({
                        content: `Vous êtes déjà inscrit à cette séance.`,
                        ephemeral: true,
                    });
                }

                // update message
                const messageChanel = channels.find((channel) => channel.name === salle);
                const channelInstance = client.channels.cache.get(messageChanel.channelId);
                const message = await channelInstance.messages.fetch(session._id);
                const embed = message.embeds[0];
                const newEmbed = new EmbedBuilder(embed.data);
                const field = newEmbed.data.fields?.find((field) => field.name.includes("Participants"));
                if (field) {
                    field.value += `\n- ${user.firstname} ${user.lastname}`;
                    // update databases
                    await addOne(interaction.user);
                    db.updateOne({ _id: session._id }, { $push: { participants: interaction.user.id } });

                    //update event
                    addUserToEvent(salle, date, user);

                    //update message
                    message.edit({ embeds: [newEmbed] });
                    // send confirmation
                    return interaction.reply({ content: `Vous avez été ajouté à la séance.`, ephemeral: true });
                }
            } else {
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
                embed.setThumbnail("attachment://" + salle + ".png");
                // add button
                const button1 = new ButtonBuilder();
                button1.setCustomId("join");
                button1.setLabel("Rejoindre");
                button1.setStyle("Primary");
                const button2 = new ButtonBuilder();
                button2.setCustomId("leave");
                button2.setLabel("Se désinscrire");
                button2.setStyle("Danger");
                // add image
                const image = new AttachmentBuilder('./src/' + salle + '.png');

                // send message
                const channelId = channels.find((channel) => channel.name === salle).channelId;
                const channelInstance = client.channels.cache.get(channelId);
                var messageId = await channelInstance
                    .send({
                        embeds: [embed],
                        files: [image],
                        components: [new ActionRowBuilder().addComponents([button1, button2])],
                    })
                    .then((embedMessage) => embedMessage.id);

                // update databases
                const doc = { _id: messageId, participants: [interaction.user.id], date: date, salle: salle };
                await db.insert(doc);
                await addOne(interaction.user);

                // create event in calendar
                createEvent(salle, date, user, channelId, messageId);

                // send confirmation
                return interaction.reply(`Ajout d'une séance à **${salle}** le **${day}** à **${heure}h**`);
            }
        } else if (commandName === "activité") {
            const activite = await getOne(interaction.user);
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
            const séance = await db.findOne({ _id: message.id });
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
                field.value += `\n- ${user.firstname} ${user.lastname}`;
                // update databases
                await addOne(interaction.user);
                db.updateOne({ _id: séance._id }, { $push: { participants: interaction.user.id } });

                //update event
                addUserToEvent(séance.salle, séance.date, user);

                //update message
                message.edit({ embeds: [newEmbed] });
                // send confirmation
                return interaction.reply({ content: `Vous avez été ajouté à la séance.`, ephemeral: true });
            }
        } else if (buttonId == "leave") {
            const séance = await db.findOne({ _id: message.id });
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
                field.value = field.value.replace(`- ${user.firstname} ${user.lastname}`, "");
                // update databases
                await removeOne(interaction.user);
                db.updateOne({ _id: séance._id }, { $pull: { participants: interaction.user.id } });

                //update event
                removeUserFromEvent(séance.salle, séance.date, user);

                //update message and delete if no participants
                if (séance.participants.length === 1) {
                    db.deleteOne({ _id: séance._id });
                    await message.delete();
                } else {
                    message.edit({ embeds: [newEmbed] });
                }
                // send confirmation
                return interaction.reply({ content: `Vous avez été retiré de la séance.`, ephemeral: true });
            }
        }
    }
    return interaction.reply({ content: "Une erreur est survenue lors de la commande.", ephemeral: true });
});

client.login(token);

const requestListener = function (req, res) {
    if (req.url === "/calendar.ical") {
        return calendar.serve(res);
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
