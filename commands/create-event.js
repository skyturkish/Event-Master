const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js')
const { createEvent } = require('../services/event-service')
const { handleEventAction } = require('../utils/handle-event-action')
const { showModalWithInputs, handleModalSubmit } = require('../utils/modal-utils')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-event')
    .setDescription('Create an event with a title, description, user limit, and start time'),
  async execute(interaction) {
    console.log('create-event')
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
            users: [],
          })

          if (!modalInteraction.replied) {
            await handleEventAction(modalInteraction, 'create-event', event._id)
          } else {
            await modalInteraction.followUp({ content: 'Event updated successfully.', ephemeral: true })
          }
        } catch (error) {
          return modalInteraction.reply({
            content:
              error.response && error.response.data
                ? error.response.data.error
                : 'An error occurred while creating the event.',
            ephemeral: true,
          })
        }
      })
      .catch(console.error)
  },
}
