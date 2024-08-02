const { updateEvent, fetchEvent } = require('../services/event-service')
const { showModalWithInputs, handleModalSubmit } = require('../utils/modal-utils')
const { getLocalizedValue } = require('../utils/localization')

const handleEventUpdate = async (interaction, eventId) => {
  try {
    let event = await fetchEvent(eventId)

    await showModalWithInputs(
      interaction,
      'updateEventModal',
      getLocalizedValue(interaction.locale, 'commons.updateEvent'),
      event
    )

    const filter = (i) => i.customId === 'updateEventModal'
    const collected = await interaction.awaitModalSubmit({ filter, time: 60000 })

    const eventData = handleModalSubmit(collected, interaction.locale)
    if (eventData.error) {
      await collected.reply({ content: eventData.error, ephemeral: true })
      return { success: false, error: eventData.error }
    }

    try {
      await updateEvent(event._id, eventData)
      event = await fetchEvent(event._id)

      const eventUpdatedSuccessfully = getLocalizedValue(interaction.locale, 'eventUpdatedSuccessfully')

      await collected.reply({
        content: eventUpdatedSuccessfully,
        ephemeral: true,
      })

      return { success: true, data: event }
    } catch (error) {
      console.log('Error updating event:', error)

      let errorMessage = getLocalizedValue(interaction.locale, 'anErrorOccuredWhileUpdatingTheEvent')

      if (error.response && error.response.data && error.response.data.error) {
        backendErrors = getLocalizedValue(interaction.locale, 'backendErrors')
        errorMessage = backendErrors[error.response.data.error]
      }

      await collected.reply({
        content: errorMessage,
        ephemeral: true,
      })

      return { success: false, error: errorMessage }
    }
  } catch (error) {
    console.error(error)
    const anUnexpectedErrorOccurred = getLocalizedValue(interaction.locale, 'anUnexpectedErrorOccurred')
    return { success: false, error: anUnexpectedErrorOccurred }
  }
}

module.exports = {
  handleEventUpdate,
}
