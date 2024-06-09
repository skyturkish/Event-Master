const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave-event')
    .setDescription('Exit an event by selecting from the list of available events'),
  async execute(interaction) {
    await prepareEventSelection(interaction, 'leave-event')
  },
}
