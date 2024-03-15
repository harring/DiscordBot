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
    const ping = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with "Pong!"');
    const hello = new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello to someone');
    const getLabels = new SlashCommandBuilder()
        .setName('get-labels')
        .setDescription('Gets a list of all the labels on the board');
    const getCardsByLabelName = new SlashCommandBuilder()
        .setName('get-cards-with-label')
        .setDescription('Gets cards with the input label.')
        .addStringOption(option =>
            option.setName('label')
            .setDescription('Name of the label')
            .setRequired(true));

    client.application.commands.create(trelloDeadline, guild);
    client.application.commands.create(getLabels, guild);
    client.application.commands.create(ping, guild);
    client.application.commands.create(hello, guild);
    client.application.commands.create(getCardsByLabelName, guild)
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
    if (interaction.commandName === 'get-labels') {
        try {
            const labels = await getLabelsFromBoard(boardId);
            const filteredLabels = labels.filter(label => label.name.trim() !== '');
            if (filteredLabels.length > 0) {
                let reply = 'Labels on the board:\n';
                filteredLabels.forEach(label => {
                    reply += `- ${label.name} (${label.color})\n`
                });
                interaction.reply(reply);
            } else {
                interaction.reply("No labels found.");
            }
        } catch (error) {
            console.error(error);
            interaction.reply("Failed to retrieve labels.");
        }
    }

    if (interaction.commandName === 'get-cards-with-label') {
        const labelName = interaction.options.getString('label');

        try{
            const cardNames = await getCardsByLabelName(boardId, labelName);
            if (cardNames.length > 0) {
                let reply = `Cards with label ${labelName} :\n ${cardNames.join('\n- ')}`;
                interaction.reply(reply);
            } else {
                interaction.reply(`No cards found with label ${labelName}`)
            }    
        } catch (error) {
            console.error(error);
            interaction.reply("Faield to retrieve cards.");
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

async function getLabelsFromBoard(boardId) {
    return await trello.getLabelsForBoard(boardId);
}

async function getCardsByLabelName(boardId, labelName) {
    const safeLabelName = String(labelName).trim().toLowerCase();

    const labels = await trello.getLabelsForBoard(boardId);

    const label = labels.find(l => l.name.toLowerCase() === safeLabelName.toLowerCase());

    if (!label) {
        console.error("label not found.");
        return [];
    }

    const cards = await trello.getCardsOnBoard(boardId);

    const cardsWithLabel = cards.filter(card => card.labels.some(l => l.id === label.id));

    return cardsWithLabel.map(card => card.name);
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
