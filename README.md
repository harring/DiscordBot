# Trello Discord Bot

This Discord bot integrates with the Trello API to fetch cards. It responds to specific commands within a Discord server, making it easier for team members to stay updated directly through Discord.

## Current Features

- **Ping Command**: Replies with "Pong!" to test the bot's responsiveness.
- **Hello Command**: Greets the user with a personalized message.
- **Trello Deadline Command**: Retrieves and lists all Trello cards with deadlines for the current week from a specified board.

## Prerequisites

Before you start, ensure you have the following:

- Node.js installed on your machine.
- A Discord bot token.
- A Trello API key and token.
- The ID of the Trello board you want to monitor.

## Setup

1. Clone this repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Create a `config.json` file in the root directory with the following content, filling in your specific details:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "guild": "YOUR_GUILD_ID",
  "trelloKey": "YOUR_TRELLO_API_KEY",
  "trelloToken": "YOUR_TRELLO_TOKEN",
  "boardId": "YOUR_TRELLO_BOARD_ID"
}
```

## Project Background
This project is intended to be a learning experience where I try out new things. It is intended as a hobby project and might be abandoned in a non working state.
