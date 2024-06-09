const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder().setName('invite').setDescription('Replies with event invitations!'),
  async execute(interaction) {
    await prepareEventSelection(interaction, 'invite-event')
  },
}
