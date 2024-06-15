const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder().setName('start-event').setDescription('Start an event'),
  async execute(interaction) {
    await prepareEventSelection(interaction, 'start-event')
  },
}
