const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join-event')
    .setDescription('Join an event by selecting from the list of available events'),
  async execute(interaction) {
    await prepareEventSelection(interaction, 'join-event')
  },
}
