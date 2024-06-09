const { SlashCommandBuilder } = require('discord.js')
const { fetchAndSelectEvent } = require('../utils/event')

module.exports = {
  data: new SlashCommandBuilder().setName('invite').setDescription('Replies with event invitations!'),
  async execute(interaction) {
    await fetchAndSelectEvent(interaction, 'invite-event')
  },
}
