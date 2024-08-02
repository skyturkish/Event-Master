const { updateEvent, fetchEvent } = require('../services/event-service')
const { getMentionUsersString } = require('../utils/mentionUtils')
const { getLocalizedValue } = require('../utils/localization')

const handleEventCancel = async (interaction, eventId) => {
  try {
    await updateEvent(eventId, { status: 'canceled' })
    const event = await fetchEvent(eventId)

    const sorryTheEventIsCanceled = getLocalizedValue(interaction.locale, 'dynamic.sorryTheEventIsCanceled', {
      'event.title': event.title,
      'event.creator': `<@${event.creator}>`,
      participants: `${getMentionUsersString(
        event.users.filter((user) => user.status === 'attending').map((user) => user.discordID)
      )}`,
    })

    await interaction.channel.send({
      content: sorryTheEventIsCanceled,
    })
  } catch (error) {
    console.log('Error in handleEventCancel', error)

    let errorMessage = getLocalizedValue(interaction.locale, 'anErrorOccurred')

    if (error.response && error.response.data && error.response.data.error) {
      backendErrors = getLocalizedValue(interaction.locale, 'backendErrors')
      errorMessage = backendErrors[error.response.data.error]
    }

    await interaction.reply({
      content: errorMessage,
      ephemeral: true,
    })
  }
}

module.exports = {
  handleEventCancel,
}
