const {Client, GatewayIntentBits, EmbedBuilder, Partials} = require('discord.js');
const cron = require('cron');
const {addOne, removeOne, getOne} = require('./firestore');
const {token, guildId, clientId} = require('./config.json');
// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// When the client is ready, run this code (only once)
const reacts = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳'];
let message = null;
const channels = [
    {name: 'antreblock', channelId: '955472985735721010', channelEmbedId: '1031338222971797514'},
    {name: 'arkose', channelId: '955473048444756048', channelEmbedId: '1031338222992769024'},
    {name: 'climb-up', channelId: '955473017746628628', channelEmbedId: '1031338222963408936'},
    {name: 'vertical-art', channelId: '955473088005431396', channelEmbedId: '1031338222988558386'},
    {name: 'climb-up-bordeaux', channelId: '1022523538986508360', channelEmbedId: '1031338222975975424'},
];


const sendMessages = () => {
    channels.forEach(async (channel) => {
        const embed = new EmbedBuilder()
            .setTitle(`${channel.name}`)
            .setColor('GOLD')
            .setDescription(`Horaires prévus à ${channel.name}`)
            .setThumbnail('https://cdn.discordapp.com/attachments/934805065745715243/934823576807280700/Logo_ESC.png');
        const guild = client.guilds.cache.get(guildId);
        const chan = guild.channels.cache.get(channel.channelId);
        await chan.send({embeds: [embed]});
    });
};

const updateMessages = () => {
    channels.forEach(async (channel) => {
        const channelInstance = client.channels.cache.get(channel.channelId);
        const message = await channelInstance.messages.fetch(channel.channelEmbedId);
        const embed = message.embeds[0];
        const newEmbed = new EmbedBuilder(embed);
        newEmbed.setTitle(`${channel.name}`)
            .setColor('Gold')
            .setDescription(`Horaires prévus à ${channel.name}`)
            .setThumbnail('https://cdn.discordapp.com/attachments/934805065745715243/934823576807280700/Logo_ESC.png');
        message.edit({embeds: [newEmbed]}); 
    });
};

const deleteSceance = (day) => {
    channels.forEach(async (channel) => {
        const guild = client.guilds.cache.get(guildId);
        const chan = guild.channels.cache.get(channel.channelId);
        const message = await chan.messages.fetch(channel.channelEmbedId);
        const embed = message.embeds[0];
        let fields = embed.fields;
        fields = fields.filter(field => !field.name.includes(day));
        embed.fields = fields;
        await message.edit({embeds: [embed]});
    });
};


client.once('ready', () => {
    console.log('Ready!');
    //sendMessages()
    updateMessages()
    let deleteMonday = new cron.CronJob('0 0 0 * * 2', () => {
        deleteSceance('lundi');
    }, null, true, 'Europe/Paris');
    let deleteTuesday = new cron.CronJob('0 0 0 * * 3', () => {
        deleteSceance('mardi');
    }, null, true, 'Europe/Paris');
    let deleteWednesday = new cron.CronJob('0 0 0 * * 4', () => {
        deleteSceance('mercredi');
    }, null, true, 'Europe/Paris');
    let deleteThursday = new cron.CronJob('0 0 0 * * 5', () => {
        deleteSceance('jeudi');
    }, null, true, 'Europe/Paris');
    let deleteFriday = new cron.CronJob('0 0 0 * * 6', () => {
        deleteSceance('vendredi');
    }, null, true, 'Europe/Paris');
    let deleteSaturday = new cron.CronJob('0 0 0 * * 0', () => {
        deleteSceance('samedi');
    }, null, true, 'Europe/Paris');
    let deleteSunday = new cron.CronJob('0 0 0 * * 1', () => {
        deleteSceance('dimanche');
    }, null, true, 'Europe/Paris');
    deleteMonday.start();
    deleteTuesday.start();
    deleteWednesday.start();
    deleteThursday.start();
    deleteFriday.start();
    deleteSaturday.start();
    deleteSunday.start();

});

// client.on('messageReactionAdd', async (reaction, user) => {
// 	if (reaction.partial) {
// 		try {
// 			await reaction.fetch();
// 		} catch (error) {
// 			console.error('Something went wrong when fetching the message:', error);
// 			return;
// 		}
// 	}
//     const guild = client.guilds.cache.get(guildId)
//     const channel = guild.channels.cache.get('856168569522618369')
//     channel.messages.fetch({ limit: 1 }).then(messages => {
//         message= messages.first();
//     }).catch(console.error);
//     if(user.id !== '934804613377450016' ){
//         if (reaction.message === message) {
//             if (reacts.find((react) => react === reaction._emoji.name)!= null){
//                 console.log("hhe")
//                 addOne(user)
//             }
//         }
//     }
// });

// client.on('messageReactionRemove', async (reaction, user) => {
// 	if (reaction.partial) {
// 		try {
// 			await reaction.fetch();
// 		} catch (error) {
// 			console.error('Something went wrong when fetching the message:', error);
// 			return;
// 		}
// 	}
//     const guild = client.guilds.cache.get(guildId)
//     const channel = guild.channels.cache.get('856168569522618369')
//     channel.messages.fetch({ limit: 1 }).then(messages => {
//         message = messages.first();
//     }).catch(console.error);
//     if(user.id !== '934804613377450016' ){
//         if (reaction.message === message) {
//             if (reacts.find((react) => react === reaction._emoji.name)!= null){
//                 removeOne(user)
//             }
//         }
//     }
// });

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const {commandName} = interaction;

    if (commandName === 'seance') {
        const salle = interaction.options.getString('salle');
        const date = interaction.options.getString('date');
        const heure = interaction.options.getString('heure');
        const messageChanel = channels.find((channel) => channel.name === salle);
        const channelInstance = client.channels.cache.get(messageChanel.channelId);
        const message = await channelInstance.messages.fetch(messageChanel.channelEmbedId);
        const embed = message.embeds[0];
        const user = interaction.user.username;

        const newEmbed = new EmbedBuilder(embed.data);
        const field = newEmbed.data.fields?.find((field) => field.name === `**${date}** **${heure}h**`);
        if (field) {
            if (field.value.includes(user)) {
                return interaction.reply({content: 'Vous êtes déjà inscrit à cette séance', ephemeral: true});
            }
            field.value += `, *${user}*`;
        }
        else {
            newEmbed.addFields(
                {name: `**${date}** **${heure}h**`, value: `*${user}*`, inline: true}
            );
        }
        addOne(interaction.user);
        message.edit({embeds: [newEmbed]});
        await interaction.reply(`Ajout d'une séance à **${salle}** le **${date}** à **${heure}h**`);
    } 
    else if (commandName === 'activité') {
        const activite = await getOne(interaction.user)
        if ( activite ){
            interaction.reply({content: `Vous vous êtes inscrits à ${activite} séances`, ephemeral: true});
            return
        }
        interaction.reply({content: 'Vous n\'êtes inscrit à aucune séance', ephemeral: true})
        return
    } 
    else if (commandName === 'desinscrire') {
        const salle = interaction.options.getString('salle');
        const date = interaction.options.getString('date');
        const heure = interaction.options.getString('heure');
        const messageChanel = channels.find((channel) => channel.name === salle);
        const channelInstance = client.channels.cache.get(messageChanel.channelId);
        const message = await channelInstance.messages.fetch(messageChanel.channelEmbedId);
        const embed = message.embeds[0];
        const user = interaction.user.username;

        const newEmbed = new EmbedBuilder(embed.data);
        const field = newEmbed.data.fields?.find((field) => field.name === `**${date}** **${heure}h**`);
        if (field) {
            if (!field.value.includes(user)) {
                return interaction.reply({content: 'Vous n\'êtes pas inscrit à cette séance', ephemeral: true});
            }
            field.value = field.value.replace(`, *${user}*`, '');
            field.value = field.value.replace(`*${user}*`, '');
            if (field.value.length === 0) {
                newEmbed.data.fields = newEmbed.data.fields.filter(field => field.name !== `**${date}** **${heure}h**`);
            }
            else {
                newEmbed.data.fields = [newEmbed.data.fields.filter(field => field.name !== `**${date}** **${heure}h**`),field];
            }
        } else {
            return interaction.reply({content: 'Vous n\'êtes pas inscrit à cette séance', ephemeral: true});
        }
        //replace the fields in newEmbed with the new fields
        removeOne(interaction.user);
        message.edit({embeds: [newEmbed]});
        await interaction.reply({content : `Suppression d'une séance à **${salle}** le **${date}** à **${heure}h**`, ephemeral: true});
    }
});

client.login(token);
