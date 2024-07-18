const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder().setName('invite-event').setDescription('Replies with event invitations!'),
  async execute(interaction) {
    console.log('invite-event')
    await prepareEventSelection(interaction, 'invite-event')
  },
}
