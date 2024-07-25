const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder().setName('active-events').setDescription('See all active events'),
  async execute(interaction) {
    console.log('active-events')
    await prepareEventSelection(interaction, 'active-events')
  },
}
