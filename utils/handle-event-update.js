const {
  SlashCommandBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require('discord.js')
const moment = require('moment')
const { updateEvent, fetchEvent } = require('../services/event-service')

const handleEventUpdate = async (interaction, eventId) => {
  let event = await fetchEvent(eventId)

  const modal = new ModalBuilder().setCustomId('updateEventModal').setTitle('Update Event')

  const titleInput = new TextInputBuilder()
    .setCustomId('titleInput')
    .setLabel('Event Title')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(4)
    .setMaxLength(64)
    .setValue(event.title)

  const descriptionInput = new TextInputBuilder()
    .setCustomId('descriptionInput')
    .setLabel('Event Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMinLength(4)
    .setMaxLength(512)
    .setValue(event.description)

  const participantLimitInput = new TextInputBuilder()
    .setCustomId('participantLimitInput')
    .setLabel('Participant Limit')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('0 - 1000')
    .setRequired(true)
    .setValue(event.participantLimit.toString())

  const startDateInput = new TextInputBuilder()
    .setCustomId('startDateInput')
    .setLabel('Event Start Date (YYYY-MM-DD)')
    .setPlaceholder('Format: YYYY-MM-DD')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(moment(event.startTime).format('YYYY-MM-DD'))

  const startTimeInput = new TextInputBuilder()
    .setCustomId('startTimeInput')
    .setLabel('Event Start Time (HH:MM)')
    .setPlaceholder('Format: HH:MM')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(moment(event.startTime).format('HH:mm'))

  // Add each input to its own row
  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(descriptionInput),
    new ActionRowBuilder().addComponents(participantLimitInput),
    new ActionRowBuilder().addComponents(startDateInput),
    new ActionRowBuilder().addComponents(startTimeInput)
  )

  await interaction.showModal(modal)

  const filter = (i) => i.customId === 'updateEventModal'
  interaction
    .awaitModalSubmit({ filter, time: 60000 })
    .then(async (modalInteraction) => {
      const title = modalInteraction.fields.getTextInputValue('titleInput')
      const description = modalInteraction.fields.getTextInputValue('descriptionInput') || 'No description provided.'
      let participantLimit = modalInteraction.fields.getTextInputValue('participantLimitInput')
      let startDate = modalInteraction.fields.getTextInputValue('startDateInput')
      let startTime = modalInteraction.fields.getTextInputValue('startTimeInput')

      // Participant limit validation
      participantLimit = parseInt(participantLimit, 10)
      if (isNaN(participantLimit) || participantLimit < 0 || participantLimit > 1000) {
        return modalInteraction.reply({
          content: 'Participant limit must be a number between 0 and 1000.',
          ephemeral: true,
        })
      }

      // Normalize date and time format
      startDate = startDate.replace(/:/g, '-')
      startTime = startTime.replace(/-/g, ':')

      // Date and time formatting
      const dateTime = moment(`${startDate} ${startTime}`, 'YYYY-MM-DD HH:mm')

      // Check if the date is in the past
      if (dateTime.isBefore(moment())) {
        return modalInteraction.reply({
          content: 'You cannot create an event in the past.',
          ephemeral: true,
        })
      }

      const formattedDateTime = dateTime.format('YYYY-MM-DD HH:mm')

      // Send the updated event data to the backend
      try {
        await updateEvent(event._id, {
          title: title,
          description: description,
          participantLimit: participantLimit,
          startTime: dateTime.toDate(),
        })
      } catch (error) {
        console.error('Error updating event:', error)
        return modalInteraction.reply({
          content: 'There was an error updating the event. Please try again later.',
          ephemeral: true,
        })
      }

      const eventEmbed = new EmbedBuilder()
        .setTitle(`Event updated: ${title}`)
        .setDescription(description)
        .addFields(
          { name: 'Start Date and Time', value: formattedDateTime, inline: true },
          { name: 'Participant Limit', value: participantLimit.toString(), inline: true }
        )
        .setTimestamp()

      await modalInteraction.reply({ embeds: [eventEmbed] })
    })
    .catch(console.error)
}

module.exports = {
  handleEventUpdate,
}
