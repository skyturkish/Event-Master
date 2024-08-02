const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js')
const moment = require('moment')
const { getLocalizedValue } = require('../utils/localization')

const showModalWithInputs = async (interaction, customId, title, event) => {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title)

  const labels = getLocalizedValue(interaction.locale, 'modal.labels')

  const titleInput = new TextInputBuilder()
    .setCustomId('titleInput')
    .setLabel(labels.eventTitle)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMinLength(4)
    .setMaxLength(100)

  const descriptionInput = new TextInputBuilder()
    .setCustomId('descriptionInput')
    .setLabel(labels.eventDescription)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMinLength(4)
    .setMaxLength(512)

  const participantLimitInput = new TextInputBuilder()
    .setCustomId('participantLimitInput')
    .setLabel(labels.participantLimit)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1 - 1024')
    .setRequired(true)

  const startDateInput = new TextInputBuilder()
    .setCustomId('startDateInput')
    .setLabel(labels.eventStartDate)
    .setPlaceholder(labels.eventStartDatePlaceHolder)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

  const startTimeInput = new TextInputBuilder()
    .setCustomId('startTimeInput')
    .setLabel(labels.eventStartTime)
    .setPlaceholder(labels.eventStartTimePlaceHolder)
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

const handleModalSubmit = (modalInteraction, language) => {
  const noDescription = getLocalizedValue(language, 'commons.noDescription')

  const title = modalInteraction.fields.getTextInputValue('titleInput')
  const description = modalInteraction.fields.getTextInputValue('descriptionInput') || noDescription
  let participantLimit = modalInteraction.fields.getTextInputValue('participantLimitInput')
  let startDate = modalInteraction.fields.getTextInputValue('startDateInput')
  let startTime = modalInteraction.fields.getTextInputValue('startTimeInput')

  // Participant limit validation
  participantLimit = parseInt(participantLimit, 10)

  // Normalize date and time format
  startDate = startDate.replace(/[:\-.;]/g, '-')
  startTime = startTime.replace(/[:\-.;]/g, ':')

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
