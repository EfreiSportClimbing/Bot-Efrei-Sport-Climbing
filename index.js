const { Client, Intents, MessageEmbed } = require('discord.js');
const { clientId, guildId,token } = require("./config.json");
const cron =  require('cron');
const { addOne,removeOne } = require( './firestore');
// Create a new client instance
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

// When the client is ready, run this code (only once)
const reacts = ['🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯','🇰','🇱','🇲','🇳']
let message = null

client.once('ready', () => {
	console.log('Ready!');

    let scheduledMessage = new cron.CronJob('0 0 0 * * 1',async () => {
        const guild = client.guilds.cache.get(guildId)
        const channel = guild.channels.cache.get('934805065745715243')
        const embedMessage = new MessageEmbed()
        	.setTitle('Pensez bien à vous inscrire 😉')
            .setThumbnail('https://cdn.discordapp.com/attachments/934805065745715243/934823576807280700/Logo_ESC.png')
            .setDescription(':regional_indicator_a: Lundi 14h\n\n:regional_indicator_b: Lundi 18h\n\n:regional_indicator_c: Mardi 14h\n\n:regional_indicator_d: Mardi 18h\n\n:regional_indicator_e: Mercredi 14h\n\n:regional_indicator_f: Mercredi 18h\n\n:regional_indicator_g: Jeudi 14h\n\n:regional_indicator_h: Jeudi 18h\n\n:regional_indicator_i: Vendredi 14h\n\n:regional_indicator_j: Vendredi 18h\n\n:regional_indicator_k: Samedi 14h\n\n:regional_indicator_l: Samedi 18h\n\n:regional_indicator_m: Dimanche 14h\n\n:regional_indicator_n: Dimanche 18h')
            .setColor('GOLD')
            await channel.send('**Heyyy, Sondage hebdo** @Membres:')
            message = await channel.send({embeds : [embedMessage]})
            reacts.map((react)=> message.react(react))
    })
    scheduledMessage.start()
});

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
    if(user.id !== '934804613377450016' ){
        if (reaction.message === message) {
            if (reacts.find((react) => react === reaction._emoji.name)!= null){
                addOne(user)
            }
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
    if(user.id !== '934804613377450016' ){
        if (reaction.message === message) {
            if (reacts.find((react) => react === reaction._emoji.name)!= null){
                removeOne(user)
            }
        }
    }
});

// Login to Discord with your client's token
client.login(token);