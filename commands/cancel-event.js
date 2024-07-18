const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder().setName('cancel-event').setDescription('Cancel an event'),
  async execute(interaction) {
    console.log('cancel-event')
    await prepareEventSelection(interaction, 'cancel-event')
  },
}
