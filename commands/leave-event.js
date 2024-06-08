const { SlashCommandBuilder } = require('discord.js')
const { fetchAndSelectEvent, handleEventSelection } = require('../utils/event')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave-event')
    .setDescription('Exit an event by selecting from the list of available events'),
  async execute(interaction) {
    await fetchAndSelectEvent(interaction, 'leave-event')
  },
}
