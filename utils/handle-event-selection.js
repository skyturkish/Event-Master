const { fetchEvent, addOrUpdateParticipant } = require('../services/event-service')
const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')

async function handleEventSelection(interaction, action, eventId) {
  let event = await fetchEvent(eventId)

  const embed = await createEventEmbed(event, interaction.client)
  const buttons = createButtons()

  let responseMessage
  let actionMessage

  switch (action) {
    case 'join-event':
      actionMessage = `You have joined the event "${event.title}". Please confirm your participation status below.`
      break
    case 'leave-event':
      actionMessage = `You have left the event "${event.title}". Please confirm your participation status below.`
      break
    case 'update-event':
      actionMessage = `You have updated the event "${event.title}". Please confirm your participation status below.`
      break
    case 'invite-event':
      actionMessage = `You have invited others to the event "${event.title}". Please confirm your participation status below.`
      break
    default:
      actionMessage = `You have ${action}ed the event "${event.title}". Please confirm your participation status below.`
  }

  const messageOptions = {
    content: actionMessage,
    embeds: [embed],
    components: [buttons],
    ephemeral: action == 'invite-event' ? false : true,
    fetchReply: true,
  }

  if (!interaction.replied) {
    responseMessage = await interaction.reply(messageOptions)
  } else {
    responseMessage = await interaction.followUp(messageOptions)
  }

  const buttonFilter = (i) =>
    ['attending', 'declined', 'considering'].includes(i.customId) && i.user.id === interaction.user.id
  const buttonCollector = responseMessage.createMessageComponentCollector({
    filter: buttonFilter,
    time: 3 * 24 * 60 * 60 * 1000,
  }) // 3 days

  buttonCollector.on('collect', async (i) => {
    if (event.status !== 'not-started') {
      const statusMessages = {
        ongoing: 'This event is currently ongoing, you can no longer make a decision.',
        finished: 'This event has already finished, you can no longer make a decision.',
        canceled: 'This event has been canceled, you can no longer make a decision.',
      }

      const messageContent = statusMessages[event.status] || 'You can no longer make a decision for this event.'

      await i.reply({
        content: messageContent,
        ephemeral: true,
      })
      return
    }

    await addOrUpdateParticipant(eventId, i.user.id, i.customId)
    event = await fetchEvent(eventId)
    const updatedEmbed = await createEventEmbed(event, interaction.client)

    await i.update({ embeds: [updatedEmbed], components: [buttons], ephemeral: true })
  })

  buttonCollector.on('end', async () => {
    event = await fetchEvent(eventId)
    const updatedEmbed = await createEventEmbed(event, interaction.client)
    // TODO Eğer bitmişse bilgi verici bir mesaj ile değiştir ve kalsın

    await responseMessage.edit({ embeds: [updatedEmbed], components: [], ephemeral: true })
  })
}

module.exports = {
  handleEventSelection,
}
