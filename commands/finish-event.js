const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder().setName('finish-event').setDescription('Finish an event'),
  async execute(interaction) {
    console.log('finish-event')
    await prepareEventSelection(interaction, 'finish-event')
  },
}
