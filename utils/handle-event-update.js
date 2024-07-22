const { updateEvent, fetchEvent } = require('../services/event-service')
const { showModalWithInputs, handleModalSubmit } = require('../utils/modal-utils')

const handleEventUpdate = async (interaction, eventId) => {
  try {
    let event = await fetchEvent(eventId)

    await showModalWithInputs(interaction, 'updateEventModal', 'Update Event', event)

    const filter = (i) => i.customId === 'updateEventModal'
    const collected = await interaction.awaitModalSubmit({ filter, time: 60000 })

    const eventData = handleModalSubmit(collected)
    if (eventData.error) {
      await collected.reply({ content: eventData.error, ephemeral: true })
      return { success: false, error: eventData.error }
    }

    try {
      await updateEvent(event._id, eventData)
      event = await fetchEvent(event._id)

      await collected.reply({
        content: 'Event updated successfully.',
        ephemeral: true,
      })

      return { success: true, data: event }
    } catch (error) {
      console.log('Error updating event:', error)
      await collected.reply({
        content: error.response.data.error || 'An error occurred while updating the event.',
        ephemeral: true,
      })
      return { success: false, error: error.response.data.error || 'An error occurred while updating the event.' }
    }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

module.exports = {
  handleEventUpdate,
}
