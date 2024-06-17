const { fetchEvent } = require('../services/event-service')
const { ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js')

async function prepareUserSelection(interaction, eventId) {
  const event = await fetchEvent(eventId)

  const participantLimit = event.participantLimit
  const maxValues = Math.min(participantLimit, 25)

  const userRow = new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`select-users-for-invite-event:${event._id}`)
      .setPlaceholder('Select users to invite')
      .setMinValues(1)
      .setMaxValues(maxValues)
  )

  await interaction.update({
    content: `Event "${event.title}" selected. Now, select users to invite:`,
    components: [userRow],
    ephemeral: true,
  })
}

module.exports = {
  prepareUserSelection,
}
