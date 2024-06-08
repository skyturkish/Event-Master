const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { fetchEvent, addOrUpdateParticipant } = require('../services/eventService')

function getMentionUsersString(participantsIds) {
  return participantsIds.map((discordID) => `<@${discordID}>`).join(', ')
}

async function updateParticipantStatus(eventId, userId, status) {
  await addOrUpdateParticipant(eventId, userId, status)
}

async function getUpdatedEvent(eventId) {
  return await fetchEvent(eventId)
}

function createEventEmbed(eventId, embedDescription, participants, eventTitle, startTime, participantLimit) {
  const statuses = [
    { label: 'Attending ✅:', status: 'attending' },
    { label: 'Declined ❌:', status: 'declined' },
    { label: 'Considering 🤔:', status: 'considering' },
    { label: 'Invited - awaiting response 🕐:', status: 'invited' },
  ]

  let responseText = `Event ID: ${eventId}\n\n`
  responseText += `Event Title: ${eventTitle}\n`
  responseText += `Start Time: ${new Date(startTime).toLocaleString()}\n`
  responseText += `Participants: ${
    participants.filter((participant) => participant.status === 'attending').length
  }/${participantLimit}\n\n`

  statuses.forEach(({ label, status }) => {
    responseText += `${label}\n`
    const participantsString = participants
      .filter((participant) => participant.status === status)
      .map((participant) => `<@${participant.discordID}>`)
      .join(', ')

    responseText += `${participantsString}\n\n`
  })

  return new EmbedBuilder()
    .setTitle('Event Invitation')
    .setDescription(embedDescription)
    .addFields({ name: 'Responses', value: responseText })
}

function createButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('attending').setLabel('Attend').setStyle('Success'),
    new ButtonBuilder().setCustomId('declined').setLabel('Decline').setStyle('Danger'),
    new ButtonBuilder().setCustomId('considering').setLabel('Considering').setStyle('Secondary')
  )
}

const handleUserSelection = async (interaction) => {
  const selectedUsers = interaction.values
  const eventId = interaction.customId.split(':')[1]
  let selectedEvent = await getUpdatedEvent(eventId)
  const embedDescription = `You have been invited to the event ${selectedEvent.title} by ${interaction.user}.`
  const participantIDs = selectedEvent.participants.map((participant) => participant.discordID)
  const uniqueUsers = selectedUsers.filter((user) => !participantIDs.includes(user))

  try {
    for (const uniqueUser of uniqueUsers) {
      await updateParticipantStatus(eventId, uniqueUser, 'invited')
    }

    selectedEvent = await getUpdatedEvent(eventId)
    const participants = selectedEvent.participants
    const matchedParticipants = participants.filter((participant) => selectedUsers.includes(participant.discordID))
    const allUsersProcessed = matchedParticipants.length === selectedUsers.length
    const allSelectedUsersHaveResponded = matchedParticipants.every((participant) => participant.status !== 'invited')

    const embed = createEventEmbed(
      eventId,
      embedDescription,
      participants,
      selectedEvent.title,
      selectedEvent.startTime,
      selectedEvent.participantLimit
    )
    const buttons = createButtons()

    if (allUsersProcessed && allSelectedUsersHaveResponded) {
      await interaction.update({
        content: `All the users you invited have already responded and were not re-invited: ${getMentionUsersString(
          selectedUsers
        )}. Please check the list below for the current status.`,
        embeds: [embed],
        components: [],
        ephemeral: true,
      })
      return
    }

    const invitedUsers = participants
      .filter((participant) => selectedUsers.includes(participant.discordID) && participant.status === 'invited')
      .map((participant) => participant.discordID)

    const notInvitedUsers = participants
      .filter((participant) => selectedUsers.includes(participant.discordID) && participant.status !== 'invited')
      .map((participant) => participant.discordID)

    const inviteMessage = await interaction.channel.send({
      content: `${getMentionUsersString(invitedUsers)}, ${embedDescription}.`,
      embeds: [embed],
      components: [buttons],
    })

    if (notInvitedUsers.length > 0) {
      await interaction.reply({
        content: `The following users have already responded to the invitation and were not re-invited: ${getMentionUsersString(
          notInvitedUsers
        )}. Please check the list above for the current status.`,
        ephemeral: true,
      })
    }

    const buttonFilter = (i) => ['attending', 'declined', 'considering'].includes(i.customId)

    const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000

    const buttonCollector = inviteMessage.createMessageComponentCollector({
      filter: buttonFilter,
      time: threeDaysInMilliseconds,
    })

    buttonCollector.on('collect', async (i) => {
      const currentTime = new Date()
      const eventStartTime = new Date(selectedEvent.startTime)

      if (currentTime > eventStartTime) {
        await i.reply({
          content: 'This event has already started, you can no longer make a decision.',
          ephemeral: true,
        })
        return
      }

      await updateParticipantStatus(eventId, i.user.id, i.customId)
      selectedEvent = await getUpdatedEvent(eventId)
      const participants = selectedEvent.participants

      const updatedEmbed = createEventEmbed(
        eventId,
        embedDescription,
        participants,
        selectedEvent.title,
        selectedEvent.startTime,
        selectedEvent.participantLimit
      )
      await inviteMessage.edit({ embeds: [updatedEmbed] })
      await i.deferUpdate()
    })

    buttonCollector.on('end', async () => {
      selectedEvent = await getUpdatedEvent(eventId)
      const participants = selectedEvent.participants

      if (participants.some((participant) => participant.status === 'invited')) {
        const newButtons = createButtons()
        await inviteMessage.edit({ components: [newButtons] })
      }
    })
  } catch (error) {
    console.error('Error handling user selection:', error)
    await interaction.reply({
      content: 'There was an error handling your selection. Please try again later.',
      ephemeral: true,
    })
  }
}

module.exports = handleUserSelection
