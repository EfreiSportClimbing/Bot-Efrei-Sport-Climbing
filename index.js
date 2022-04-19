const { Client, Intents, MessageEmbed } = require('discord.js');
const cron =  require('cron');
const { addOne,removeOne, getOne } = require( './firestore');
const { token, guildId, clientId } =  require('./config.json');
// Create a new client instance
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

// When the client is ready, run this code (only once)
const reacts = ['🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯','🇰','🇱','🇲','🇳']
let message = null
const channels = [
    {name : 'antreblock', channelId : '955472985735721010', channelEmbedId : '965621047057604648'},
    {name : 'arkose' , channelId : "955473048444756048", channelEmbedId : '965621047133093898'},
    {name :"climb-up", channelId : "955473017746628628", channelEmbedId : '965012209690345542'},
    {name : "vertical-art", channelId : "955473088005431396", channelEmbedId : '965012209690374214' }
]


const sendMessages = () => {
    channels.forEach(async (channel) => {
        const embed = new MessageEmbed()
            .setTitle(`${channel.name}`)
            .setColor('GOLD')
            .setDescription(`Horaires prévues à ${channel.name}`)
            .setThumbnail('https://cdn.discordapp.com/attachments/934805065745715243/934823576807280700/Logo_ESC.png');
        const guild = client.guilds.cache.get(guildId)
        const chan = guild.channels.cache.get(channel.channelId);
        await chan.send({embeds : [embed]});
    })
}

const deleteSceance = (day) => {
    channels.forEach(async (channel) => {
        const guild = client.guilds.cache.get(guildId)
        const chan = guild.channels.cache.get(channel.channelId);
        const message = await channelInstance.messages.fetch(channel.channelEmbedId)
        const embed = message.embeds[0]
        const fields = embed.fields
        fields = fields.filter(field => !field.name.includes(day))
        embed.fields = fields
        await message.edit({embeds : [embed]})
    })
}





client.once('ready', () => {
	console.log('Ready!');
    // sendMessages()
    let deleteMonday = new cron.CronJob('0 0 0 * * 2', () => {
        deleteSceance('lundi')
    }, null, true, 'Europe/Paris');
    let deleteTuesday = new cron.CronJob('0 0 0 * * 3', () => {
        deleteSceance('mardi')
    }, null, true, 'Europe/Paris');
    let deleteWednesday = new cron.CronJob('0 0 0 * * 4', () => {
        deleteSceance('mercredi')
    }, null, true, 'Europe/Paris');
    let deleteThursday = new cron.CronJob('0 0 0 * * 5', () => {
        deleteSceance('jeudi')
    }, null, true, 'Europe/Paris');
    let deleteFriday = new cron.CronJob('0 0 0 * * 6', () => {
        deleteSceance('vendredi')
    }, null, true, 'Europe/Paris');
    let deleteSaturday = new cron.CronJob('0 0 0 * * 0', () => {
        deleteSceance('samedi')
    }, null, true, 'Europe/Paris');
    let deleteSunday = new cron.CronJob('0 0 0 * * 1', () => {
        deleteSceance('dimanche')
    }, null, true, 'Europe/Paris');
    deleteMonday.start();
    deleteTuesday.start();
    deleteWednesday.start();
    deleteThursday.start();
    deleteFriday.start();
    deleteSaturday.start();
    deleteSunday.start();

    // const guild = client.guilds.cache.get(guildId)
    // let scheduledMessage = new cron.CronJob('0 19 0 * * 6',async () => {
    //     const channel = guild.channels.cache.get('856168569522618369')
    //     const embedMessage = new MessageEmbed()
    //     	.setTitle('Pensez bien à vous inscrire 😉')
    //         .setThumbnail('https://cdn.discordapp.com/attachments/934805065745715243/934823576807280700/Logo_ESC.png')
    //         .setDescription(':regional_indicator_a: Lundi 14h\n\n:regional_indicator_b: Lundi 18h\n\n:regional_indicator_c: Mardi 14h\n\n:regional_indicator_d: Mardi 18h\n\n:regional_indicator_e: Mercredi 14h\n\n:regional_indicator_f: Mercredi 18h\n\n:regional_indicator_g: Jeudi 14h\n\n:regional_indicator_h: Jeudi 18h\n\n:regional_indicator_i: Vendredi 14h\n\n:regional_indicator_j: Vendredi 18h\n\n:regional_indicator_k: Samedi 14h\n\n:regional_indicator_l: Samedi 18h\n\n:regional_indicator_m: Dimanche 14h\n\n:regional_indicator_n: Dimanche 18h')
    //         .setColor('GOLD')
    //         await channel.send('**Heyyy, Sondage hebdo** <@&752444499795640360>:')
    //         message = await channel.send({embeds : [embedMessage]})
    //         reacts.map((react)=> message.react(react))
    // })
    // scheduledMessage.start()
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
	const { commandName } = interaction;

	if (commandName === 'seance') {
        const salle = interaction.options.getString('salle');
        const date = interaction.options.getString("date");
        const heure = interaction.options.getString("heure");
        const messageChanel = channels.find((channel) => channel.name === salle)
        const channelInstance = client.channels.cache.get(messageChanel.channelId)
        const message = await channelInstance.messages.fetch(messageChanel.channelEmbedId)
        const embed = message.embeds[0]
        const user = interaction.user.username
        
        const newEmbed = new MessageEmbed(embed)
        const field = newEmbed.fields.find((field) => field.name === `**${date}** **${heure}h**`)
        if (field) {
            if (field.value.includes(user)){
                return interaction.reply('Vous êtes déjà inscrit à cette séance')
            }
            field.value += `, *${user}*`
        }else {
            newEmbed.addField(`**${date}** **${heure}h**`, `*${user}*`)
        }
        addOne(interaction.user)
        message.edit({embeds : [newEmbed]})
		await interaction.reply(`Ajout d'une séance à **${salle}** le **${date}** à **${heure}h**`);
	}
    else if (commandName === 'activité') {
        getOne(interaction.user).then((activite) => {
            interaction.reply(`Vous vous etes inscris à ${activite} séances`)
        }).catch(
            () => interaction.reply('Vous n\'êtes pas inscrit à aucune séance')
        )
    }
});

client.login(token);