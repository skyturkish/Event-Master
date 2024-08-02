const { fetchEvent } = require('../services/event-service')
const { ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js')
const { getLocalizedValue } = require('../utils/localization')

async function prepareUserSelection(interaction, eventId) {
  const event = await fetchEvent(eventId)

  const participantLimit = event.participantLimit
  const maxValues = Math.min(participantLimit, 25)
  const selectUsersToInvite = getLocalizedValue(interaction.locale, 'commons.selectUsersToInvite')

  const userRow = new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`select-users-for-invite-event:${event._id}`)
      .setPlaceholder(selectUsersToInvite)
      .setMinValues(1)
      .setMaxValues(maxValues)
  )
  const eventSelected = getLocalizedValue(interaction.locale, 'dynamic.eventSelected', {
    'event.title': event.title,
  })

  await interaction.update({
    content: eventSelected,
    components: [userRow],
    ephemeral: true,
  })
}

module.exports = {
  prepareUserSelection,
}
