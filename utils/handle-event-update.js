const { updateEvent, fetchEvent } = require('../services/event-service')
const { handleEventAction } = require('./handle-event-selection')
const { showModalWithInputs, handleModalSubmit } = require('../utils/modal-utils')

const handleEventUpdate = async (interaction, eventId) => {
  let event = await fetchEvent(eventId)

  await showModalWithInputs(interaction, 'updateEventModal', 'Update Event', event)

  const filter = (i) => i.customId === 'updateEventModal'
  interaction
    .awaitModalSubmit({ filter, time: 60000 })
    .then(async (modalInteraction) => {
      const eventData = handleModalSubmit(modalInteraction)
      if (eventData.error) {
        return modalInteraction.reply({ content: eventData.error, ephemeral: true })
      }

      try {
        await updateEvent(event._id, eventData)
      } catch (error) {
        console.error('Error updating event:', error)

        return modalInteraction.reply({
          content: error.response.data.error,
          ephemeral: true,
        })
      }

      if (!modalInteraction.replied) {
        await handleEventAction(modalInteraction, 'update-event', eventId)
      } else {
        await modalInteraction.followUp({ content: 'Event updated successfully.', ephemeral: true })
      }
    })
    .catch(console.error)
}

module.exports = {
  handleEventUpdate,
}
