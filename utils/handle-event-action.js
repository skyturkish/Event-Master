const { fetchEvent, addOrUpdateUser, updateEvent } = require('../services/event-service')
const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')
const { getMentionUsersString } = require('./mentionUtils')
const { handleEventUpdate } = require('./handle-event-update')
const { getLocalizedValue } = require('../utils/localization')

async function handleEventAction(interaction, action, eventId, actionMessage) {
  try {
    let event = await fetchEvent(eventId)

    if (action != 'update-event' && action != 'create-event') {
      try {
        const youSelectedTheEvent = getLocalizedValue(interaction.locale, 'dynamic.youSelectedEvent', {
          'event.title': event.title,
        })

        await interaction.update({
          content: youSelectedTheEvent,
          components: [],
        })
      } catch (error) {
        console.log('Error updating interaction:', error)
      }
    }

    if (!event) {
      await interaction.reply({
        content: `Event with ID ${eventId} not found.`,
        ephemeral: true,
      })
      return
    }

    let isEphemeral = false

    if (action == 'join-event') {
      await addOrUpdateUser(eventId, interaction.user.id, 'attending')

      actionMessage = getLocalizedValue(interaction.locale, 'dynamic.actionMessages.youHaveJoinedTheEvent', {
        'event.title': event.title,
      })

      isEphemeral = true
    } else if (action == 'leave-event') {
      await addOrUpdateUser(eventId, interaction.user.id, 'declined')

      actionMessage = getLocalizedValue(interaction.locale, 'dynamic.actionMessages.youHaveLeftTheEvent', {
        'event.title': event.title,
      })

      isEphemeral = true
    } else if (action == 'update-event') {
      const response = await handleEventUpdate(interaction, eventId)
      if (!response.success) return

      actionMessage = getLocalizedValue(interaction.locale, 'dynamic.actionMessages.youHaveUpdatedTheEvent', {
        'event.title': event.title,
      })
    } else if (action == 'invite-event') {
    } else if (action == 'create-event') {
      actionMessage = getLocalizedValue(interaction.locale, 'dynamic.actionMessages.youHaveCreatedTheEvent', {
        'event.title': event.title,
      })
    } else if (action == 'start-event') {
      await updateEvent(eventId, { status: 'ongoing' })

      actionMessage = getLocalizedValue(interaction.locale, 'dynamic.actionMessages.youHaveStartedTheEvent', {
        'event.title': event.title,
      })
    } else if (action == 'finish-event') {
      await updateEvent(eventId, { status: 'finished' })
      actionMessage = getLocalizedValue(interaction.locale, 'dynamic.actionMessages.youHaveFinishedTheEvent', {
        'event.title': event.title,
      })
    } else if (action == 'cancel-event') {
      actionMessage = getLocalizedValue(interaction.locale, 'dynamic.actionMessages.youHaveCanceledTheEvent', {
        'event.title': event.title,
      })
    } else if (action == 'events') {
      actionMessage = getLocalizedValue(interaction.locale, 'dynamic.actionMessages.youHaveSelectedTheEvent', {
        'event.title': event.title,
      })
    }
    event = await fetchEvent(eventId)

    const attendingUsers = event.users.filter((p) => p.status === 'attending')

    if (event.status === 'not-started' && attendingUsers.length >= event.participantLimit) {
      await updateEvent(eventId, { status: 'ready-to-start' })

      const weHaveHitTheMagicNumber = getLocalizedValue(interaction.locale, 'dynamic.weHaveHitTheMagicNumber', {
        participants: getMentionUsersString(attendingUsers.map((p) => p.discordID)),
      })

      await interaction.channel.send({
        content: weHaveHitTheMagicNumber,
      })
      event = await fetchEvent(eventId)
    }

    const embed = await createEventEmbed({ event, client: interaction.client, language: interaction.locale })
    const buttons = createButtons({ language: interaction.locale })

    const messageOptions = {
      content: actionMessage,
      embeds: [embed],
      components: event.status == 'not-started' || event.status == 'ready-to-start' ? [buttons] : [],
      ephemeral: isEphemeral,
      fetchReply: true,
    }

    let responseMessage

    try {
      if (!interaction.deferred && !interaction.replied) {
        responseMessage = await interaction.reply(messageOptions)
      } else {
        responseMessage = await interaction.followUp(messageOptions)
      }
    } catch (error) {
      console.error('Error handling interaction:', error)

      const anErrorOccurredWhileHandlingTheInteraction = getLocalizedValue(
        interaction.locale,
        'anErrorOccurredWhileHandlingTheInteraction'
      )

      await interaction.reply({
        content: anErrorOccurredWhileHandlingTheInteraction,
        ephemeral: true,
      })
      return
    }

    const buttonFilter = (i) => ['attending', 'declined', 'considering'].includes(i.customId)
    const buttonCollector = responseMessage.createMessageComponentCollector({
      filter: buttonFilter,
      time: 3 * 24 * 60 * 60 * 1000,
    }) // 3 days

    buttonCollector.on('collect', async (i) => {
      try {
        event = await addOrUpdateUser(eventId, i.user.id, i.customId)
        const updatedEmbed = await createEventEmbed({ event, client: interaction.client, language: interaction.locale })

        const attendingUsers = event.users.filter((p) => p.status === 'attending')
        if (event.status === 'not-started' && attendingUsers.length >= event.participantLimit) {
          await updateEvent(eventId, { status: 'ready-to-start' })

          const weHaveHitTheMagicNumber = getLocalizedValue(interaction.locale, 'dynamic.weHaveHitTheMagicNumber', {
            participants: getMentionUsersString(attendingUsers.map((p) => p.discordID)),
          })
          await interaction.channel.send({
            content: weHaveHitTheMagicNumber,
          })
          event = await fetchEvent(eventId)
        }

        await i.update({
          embeds: [updatedEmbed],
          components: event.status == 'not-started' || event.status == 'ready-to-start' ? [buttons] : [],
          ephemeral: isEphemeral,
        })

        buttonCollector.on('end', async () => {
          event = await fetchEvent(eventId)
          const updatedEmbed = await createEventEmbed({
            event,
            client: interaction.client,
            language: interaction.locale,
          })

          await responseMessage.edit({ embeds: [updatedEmbed], components: [], ephemeral: isEphemeral })
        })
      } catch (error) {
        console.log('Error:', error)
        let errorMessage = getLocalizedValue(interaction.locale, 'anErrorOccurred')

        if (error.response && error.response.data && error.response.data.error) {
          backendErrors = getLocalizedValue(interaction.locale, 'backendErrors')
          errorMessage = backendErrors[error.response.data.error]
        }

        await i.reply({
          content: errorMessage,
          ephemeral: true,
        })
      }
    })
  } catch (error) {
    console.log('Handle Event Action Error:', error)
    let errorMessage = getLocalizedValue(interaction.locale, 'anErrorOccurred')

    if (error.response && error.response.data && error.response.data.error) {
      backendErrors = getLocalizedValue(interaction.locale, 'backendErrors')
      errorMessage = backendErrors[error.response.data.error]
    }

    await interaction.reply({
      content: errorMessage,
      ephemeral: true,
    })
  }
}

module.exports = {
  handleEventAction,
}
