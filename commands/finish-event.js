const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder().setName('finish-event').setDescription('Finish an event'),
  async execute(interaction) {
    await prepareEventSelection(interaction, 'finish-event')
  },
}
