const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder().setName('events').setDescription('See all events'),
  async execute(interaction) {
    console.log('events')
    await prepareEventSelection(interaction, 'events')
  },
}
