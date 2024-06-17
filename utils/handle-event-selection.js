const { fetchEvent, addOrUpdateUser, updateEvent } = require('../services/event-service')
const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')
const { getMentionUsersString } = require('../utils/mentionUtils')

async function handleEventAction(interaction, action, eventId, actionMessage) {
  if (action === 'join-event') {
    await addOrUpdateUser(eventId, interaction.user.id, 'attending')
  } else if (action === 'leave-event') {
    await addOrUpdateUser(eventId, interaction.user.id, 'declined')
  } else if (action === 'start-event') {
    await updateEvent(eventId, { status: 'ongoing' })
  } else if (action === 'finish-event') {
    await updateEvent(eventId, { status: 'finished' })
  }

  const isEphemeralByAction = {
    'join-event': true,
    'leave-event': true,
    'update-event': false,
    'invite-event': false,
    'create-event': false,
    'start-event': false,
    'finish-event': false,
    'cancel-event': false,
  }[action]

  let event = await fetchEvent(eventId)

  const attendingUsers = event.users.filter((p) => p.status === 'attending')

  if (event.status === 'not-started' && attendingUsers.length >= event.participantLimit) {
    await updateEvent(eventId, { status: 'ready-to-start' })
    await interaction.channel.send({
      content: `We've hit the magic number of participants! 🎉 The event can kick off as soon as the time arrives! Here are the awesome attendees: ${getMentionUsersString(
        attendingUsers.map((p) => p.discordID)
      )}`,
    })
    event = await fetchEvent(eventId)
  }

  const embed = await createEventEmbed(event, interaction.client)
  const buttons = createButtons()

  if (!actionMessage) {
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
      case 'create-event':
        actionMessage = `You have created the event "${event.title}". Please confirm your participation status below.`
        break
      case 'start-event':
        actionMessage = `You have started the event "${event.title}". Please confirm your participation status below.`
        break
      case 'finish-event':
        actionMessage = `You have finished the event "${event.title}". Please confirm your participation status below.`
        break
      case 'cancel-event':
        actionMessage = `You have canceled the event "${event.title}". Please confirm your participation status below.`
        break
      default:
        actionMessage = `You have ${action}ed the event "${event.title}". Please confirm your participation status below.`
    }
  }

  const messageOptions = {
    content: actionMessage,
    embeds: [embed],
    components: [buttons],
    ephemeral: isEphemeralByAction,
    fetchReply: true,
  }

  let responseMessage

  if (!interaction.replied) {
    responseMessage = await interaction.reply(messageOptions)
  } else {
    responseMessage = await interaction.followUp(messageOptions)
  }

  const buttonFilter = (i) => ['attending', 'declined', 'considering'].includes(i.customId)
  const buttonCollector = responseMessage.createMessageComponentCollector({
    filter: buttonFilter,
    time: 3 * 24 * 60 * 60 * 1000,
  }) // 3 days

  buttonCollector.on('collect', async (i) => {
    try {
      await addOrUpdateUser(eventId, i.user.id, i.customId)
      event = await fetchEvent(eventId)
      const updatedEmbed = await createEventEmbed(event, interaction.client)

      const attendingUsers = event.users.filter((p) => p.status === 'attending')
      if (event.status === 'not-started' && attendingUsers.length >= event.participantLimit) {
        await updateEvent(eventId, { status: 'ready-to-start' })
        await interaction.channel.send({
          content: `We've hit the magic number of participants! 🎉 The event can kick off as soon as the time arrives! Here are the awesome attendees: ${getMentionUsersString(
            attendingUsers.map((p) => p.discordID)
          )}`,
        })
        event = await fetchEvent(eventId)
      }

      await i.update({ embeds: [updatedEmbed], components: [buttons], ephemeral: isEphemeralByAction })
    } catch (error) {
      await i.reply({
        content: error.response.data.error,
        ephemeral: true,
      })
    }
  })

  buttonCollector.on('end', async () => {
    event = await fetchEvent(eventId)
    const updatedEmbed = await createEventEmbed(event, interaction.client)

    await responseMessage.edit({ embeds: [updatedEmbed], components: [], ephemeral: isEphemeralByAction })
  })
}

module.exports = {
  handleEventAction,
}
