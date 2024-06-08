const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')
const { fetchEvent, addOrUpdateParticipant } = require('../services/eventService')

const handleEventSelectionForJoin = async (interaction) => {
  const eventId = interaction.values[0]
  let selectedEvent = await fetchEvent(eventId)

  const embed = await createEventEmbed(selectedEvent, interaction.client)
  const buttons = createButtons()

  const responseMessage = await interaction.reply({
    content: `You have joined the event "${selectedEvent.title}". Please confirm your participation status below.`,
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

module.exports = handleEventSelectionForJoin
