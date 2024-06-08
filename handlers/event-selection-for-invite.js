const { ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js')
const { fetchEventsByGuild } = require('../services/eventService')

const handleEventSelection = async (interaction) => {
  const eventId = interaction.values[0]

  const events = await fetchEventsByGuild(interaction.guildId)

  const selectedEvent = events.find((event) => event._id === eventId)

  const participantLimit = selectedEvent.participantLimit
  const maxValues = Math.min(participantLimit, 25)

  const userRow = new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId('select-users-for-invite')
      .setPlaceholder('Select users to invite')
      .setMinValues(1)
      .setMaxValues(maxValues)
  )

  await interaction.update({
    content: `Event "${selectedEvent.title}" selected. Now, select users to invite:`,
    components: [userRow],
    ephemeral: true,
  })
}

module.exports = handleEventSelection
