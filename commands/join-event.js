const { SlashCommandBuilder } = require('discord.js')
const { fetchAndSelectEvent } = require('../utils/event')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join-event')
    .setDescription('Join an event by selecting from the list of available events'),
  async execute(interaction) {
    await fetchAndSelectEvent(interaction, 'join-event')
  },
}
