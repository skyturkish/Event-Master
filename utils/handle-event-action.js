const { fetchEvent, addOrUpdateUser, updateEvent } = require('../services/event-service')
const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')
const { getMentionUsersString } = require('./mentionUtils')
const { handleEventUpdate } = require('./handle-event-update')

async function handleEventAction(interaction, action, eventId, actionMessage) {
  try {
    let event = await fetchEvent(eventId)

    if (!event) {
      return interaction.reply({
        content: `Event with ID ${eventId} not found.`,
      })
    }

    let isEphemeral = false

    if (action == 'join-event') {
      await addOrUpdateUser(eventId, interaction.user.id, 'attending')

      actionMessage = `You have joined the event "${event.title}". Please confirm your participation status below.`
      isEphemeral = true
    } else if (action == 'leave-event') {
      await addOrUpdateUser(eventId, interaction.user.id, 'declined')

      actionMessage = `You have left the event "${event.title}". Please confirm your participation status below.`
      isEphemeral = true
    } else if (action == 'update-event') {
      const response = await handleEventUpdate(interaction, eventId)
      if (!response.success) return

      actionMessage = `You have updated the event "${event.title}". Please confirm your participation status below.`
    } else if (action == 'invite-event') {
    } else if (action == 'create-event') {
      actionMessage = `You have created the event "${event.title}". Please confirm your participation status below.`
    } else if (action == 'start-event') {
      await updateEvent(eventId, { status: 'ongoing' })

      actionMessage = `You have started the event "${event.title}". Please confirm your participation status below.`
    } else if (action == 'finish-event') {
      await updateEvent(eventId, { status: 'finished' })

      actionMessage = `You have finished the event "${event.title}". Please confirm your participation status below.`
    } else if (action == 'cancel-event') {
      actionMessage = `You have canceled the event "${event.title}". Please confirm your participation status below.`
    }
    event = await fetchEvent(eventId)

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

    const messageOptions = {
      content: actionMessage,
      embeds: [embed],
      components: [buttons],
      ephemeral: isEphemeral,
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

        await i.update({ embeds: [updatedEmbed], components: [buttons], ephemeral: isEphemeral })
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

      await responseMessage.edit({ embeds: [updatedEmbed], components: [], ephemeral: isEphemeral })
    })
  } catch (error) {
    console.log('Error:', error)
    return interaction.reply({
      content:
        (error.response && error.response.data && error.response.data.error) || error.message || 'An error occurred.',
      ephemeral: true,
    })
  }
}

module.exports = {
  handleEventAction,
}
