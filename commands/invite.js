const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')
const { fetchEventsByGuild } = require('../services/eventService')

module.exports = {
  data: new SlashCommandBuilder().setName('invite').setDescription('Replies with event invitations!'),
  async execute(interaction) {
    const events = await fetchEventsByGuild(interaction.guildId)

    if (events.length === 0) {
      await interaction.reply({ content: 'No events available.', ephemeral: true })
      return
    }

    const eventOptions = events.map((event) => ({
      label: event.title,
      description: event.description,
      value: event._id,
    }))

    const eventRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select-event-for-invite')
        .setPlaceholder('Select an event')
        .addOptions(eventOptions)
    )

    await interaction.reply({ content: 'Please select an event to invite:', components: [eventRow], ephemeral: true })
  },
}
