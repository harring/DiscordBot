const { token, guild, trelloKey, trelloToken, boardId } = require('./config.json');
const { Client, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const Trello = require('trello');
const trello = new Trello(trelloKey, trelloToken);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}`);

    const trelloDeadline = new SlashCommandBuilder()
        .setName('trello-deadline')
        .setDescription('Gets cards with deadlines this week');
    client.application.commands.create(trelloDeadline, guild);
    const ping = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with "Pong!"');
    const hello = new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello to someone');

    client.application.commands.create(ping, guild);
    client.application.commands.create(hello, guild);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        interaction.reply("Pong!");
    }
    if (interaction.commandName === 'hello') {
        interaction.reply(`Hello ${interaction.user.username}!`);
    } 
    if (interaction.commandName === 'trello-deadline') {
        try {
            const cards = await getCardsWithDeadlineThisWeek(boardId);
            if (cards.length > 0) {
                let reply = 'Cards with deadline this week:\n';
                cards.forEach(card => {
                    reply += `- ${card.name} (Deadline: ${card.due})\n`
                });
                interaction.reply(reply);
            } else {
                interaction.reply("No cards with deadline this week.");
            }
        } catch (error) {
            console.error(error);
            interaction.reply("Failed to retrieve cards");
        }
    }
});

async function getCardsWithDeadlineThisWeek(boardId) {
    const cards = await trello.getCardsOnBoard(boardId);
    const startOfWeek = startOfWeekDate();
    const endOfWeek = endOfWeekDate();
    return cards.filter(card => {
        const dueDate = new Date(card.due);
        return dueDate >= startOfWeek && dueDate <= endOfWeek && card.dueComplete === false;
    });
}

function startOfWeekDate() {
    const now = new Date();
    const firstDayOfWeek = now.getDate() - now.getDay() + (now.getDay() === 0? -6 : 1);
    return new Date(now.setDate(firstDayOfWeek));
}
function endOfWeekDate() {
    const startofWeek = startOfWeekDate();
    return new Date(startofWeek.getFullYear(), startofWeek.getMonth(), startofWeek.getDate() + 6);
}

client.login(token);
