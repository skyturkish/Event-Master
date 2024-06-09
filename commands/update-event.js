const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update-event')
    .setDescription('Update an event with a title, description, participant limit, and start time'),
  async execute(interaction) {
    await prepareEventSelection(interaction, 'update-event')
  },
}
