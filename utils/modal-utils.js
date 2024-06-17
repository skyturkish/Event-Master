const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js')
const moment = require('moment')

const showModalWithInputs = async (interaction, customId, title, event) => {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title)

  const titleInput = new TextInputBuilder()
    .setCustomId('titleInput')
    .setLabel('Event Title')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMinLength(4)
    .setMaxLength(100)

  const descriptionInput = new TextInputBuilder()
    .setCustomId('descriptionInput')
    .setLabel('Event Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMinLength(4)
    .setMaxLength(512)

  const participantLimitInput = new TextInputBuilder()
    .setCustomId('participantLimitInput')
    .setLabel('Participant Limit')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('0 - 1000')
    .setRequired(true)

  const startDateInput = new TextInputBuilder()
    .setCustomId('startDateInput')
    .setLabel('Event Start Date (YYYY-MM-DD)')
    .setPlaceholder('Format: YYYY-MM-DD')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

  const startTimeInput = new TextInputBuilder()
    .setCustomId('startTimeInput')
    .setLabel('Event Start Time (HH:MM)')
    .setPlaceholder('Format: HH:MM')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

  if (event) {
    titleInput.setValue(event.title)
    descriptionInput.setValue(event.description)
    participantLimitInput.setValue(event.participantLimit.toString())
    startDateInput.setValue(moment(event.startTime).format('YYYY-MM-DD'))
    startTimeInput.setValue(moment(event.startTime).format('HH:mm'))
  }

  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(descriptionInput),
    new ActionRowBuilder().addComponents(participantLimitInput),
    new ActionRowBuilder().addComponents(startDateInput),
    new ActionRowBuilder().addComponents(startTimeInput)
  )

  await interaction.showModal(modal)
}

const handleModalSubmit = (modalInteraction) => {
  const title = modalInteraction.fields.getTextInputValue('titleInput')
  const description = modalInteraction.fields.getTextInputValue('descriptionInput') || 'No description provided.'
  let participantLimit = modalInteraction.fields.getTextInputValue('participantLimitInput')
  let startDate = modalInteraction.fields.getTextInputValue('startDateInput')
  let startTime = modalInteraction.fields.getTextInputValue('startTimeInput')

  // Participant limit validation
  participantLimit = parseInt(participantLimit, 10)

  // Normalize date and time format
  startDate = startDate.replace(/:/g, '-')
  startTime = startTime.replace(/-/g, ':')

  // Date and time formatting
  const dateTime = moment(`${startDate} ${startTime}`, 'YYYY-MM-DD HH:mm')

  return {
    title,
    description,
    participantLimit,
    startTime: dateTime.toDate(),
  }
}

module.exports = {
  showModalWithInputs,
  handleModalSubmit,
}
