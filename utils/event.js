const { fetchEventsByGuild, fetchEvent, addOrUpdateParticipant } = require('../services/eventService')
const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

async function fetchAndSelectEvent(interaction, commandName) {
  const events = await fetchEventsByGuild(interaction.guildId)

  if (events.length === 0) {
    await interaction.reply({ content: 'No events available.', ephemeral: true })
    return
  }

  const eventOptions = events.map((event) => ({
    label: event.title,
    description: event.description,
    value: event._id,
  }))

  const eventRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select-event-for-${commandName}`)
      .setPlaceholder('Select an event')
      .addOptions(eventOptions)
  )

  await interaction.reply({ content: 'Please select an event:', components: [eventRow], ephemeral: true })
}

async function handleEventSelection(interaction, action) {
  const eventId = interaction.values[0]
  let selectedEvent = await fetchEvent(eventId)

  const embed = await createEventEmbed(selectedEvent, interaction.client)
  const buttons = createButtons()

  const responseMessage = await interaction.reply({
    content: `You have ${action}ed the event "${selectedEvent.title}". Please confirm your participation status below.`,
    embeds: [embed],
    components: [buttons],
    ephemeral: true,
    fetchReply: true,
  })

  const buttonFilter = (i) =>
    ['attending', 'declined', 'considering'].includes(i.customId) && i.user.id === interaction.user.id
  const buttonCollector = responseMessage.createMessageComponentCollector({
    filter: buttonFilter,
    time: 3 * 24 * 60 * 60 * 1000,
  }) // 3 days

  buttonCollector.on('collect', async (i) => {
    await addOrUpdateParticipant(eventId, i.user.id, i.customId)
    selectedEvent = await fetchEvent(eventId)
    const updatedEmbed = await createEventEmbed(selectedEvent, interaction.client)

    await i.update({ embeds: [updatedEmbed], components: [buttons], ephemeral: true })
  })

  buttonCollector.on('end', async () => {
    selectedEvent = await fetchEvent(eventId)
    const updatedEmbed = await createEventEmbed(selectedEvent, interaction.client)

    await responseMessage.edit({ embeds: [updatedEmbed], components: [], ephemeral: true })
  })
}

module.exports = {
  fetchAndSelectEvent,
  handleEventSelection,
}
