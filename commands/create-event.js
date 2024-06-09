const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js')
const moment = require('moment')
const { createEvent } = require('../services/event-service')
const { handleEventSelection } = require('../utils/handle-event-selection')
const { showModalWithInputs, handleModalSubmit } = require('../utils/modal-utils')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-event')
    .setDescription('Create an event with a title, description, participant limit, and start time'),
  async execute(interaction) {
    await showModalWithInputs(interaction, 'eventModal', 'Create Event')

    const filter = (i) => i.customId === 'eventModal'
    interaction
      .awaitModalSubmit({ filter, time: 60000 })
      .then(async (modalInteraction) => {
        const eventData = handleModalSubmit(modalInteraction)
        if (eventData.error) {
          return modalInteraction.reply({ content: eventData.error, ephemeral: true })
        }

        try {
          const event = await createEvent({
            ...eventData,
            creator: interaction.user.id,
            guild: interaction.guild.id,
            participants: [{ discordID: interaction.user.id, status: 'attending' }],
          })

          if (!modalInteraction.replied) {
            await handleEventSelection(modalInteraction, 'update-event', event._id)
          } else {
            await modalInteraction.followUp({ content: 'Event updated successfully.', ephemeral: true })
          }
        } catch (error) {
          console.error('Error creating event:', error)
          return modalInteraction.reply({
            content: 'There was an error creating the event. Please try again later.',
            ephemeral: true,
          })
        }
      })
      .catch(console.error)
  },
}
