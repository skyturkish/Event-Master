const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')
const { fetchEvent, addOrUpdateParticipant } = require('../services/eventService')

function getMentionUsersString(participantsIds) {
  return participantsIds.map((discordID) => `<@${discordID}>`).join(', ')
}

const handleUserSelection = async (interaction) => {
  const selectedUsers = interaction.values
  const eventId = interaction.customId.split(':')[1]
  let selectedEvent = await fetchEvent(eventId)
  const embedDescription = `You have been invited to the event ${selectedEvent.title} by ${interaction.user}.`
  const participantIDs = selectedEvent.participants.map((participant) => participant.discordID)
  const uniqueUsers = selectedUsers.filter((user) => !participantIDs.includes(user))

  try {
    for (const uniqueUser of uniqueUsers) {
      await addOrUpdateParticipant(eventId, uniqueUser, 'invited')
    }

    selectedEvent = await fetchEvent(eventId)
    const participants = selectedEvent.participants
    const matchedParticipants = participants.filter((participant) => selectedUsers.includes(participant.discordID))
    const allUsersProcessed = matchedParticipants.length === selectedUsers.length
    const allSelectedUsersHaveResponded = matchedParticipants.every((participant) => participant.status !== 'invited')

    const embed = await createEventEmbed(selectedEvent, interaction.client)
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

    let content = `The following users have been successfully invited to the event: ${getMentionUsersString(
      invitedUsers
    )}.`

    if (notInvitedUsers.length > 0) {
      content += ` However, the following users had already responded to the invitation and were not re-invited: ${getMentionUsersString(
        notInvitedUsers
      )}. Please check the list below for their current status.`
    }

    await interaction.update({
      content: content,
      embeds: [],
      components: [],
      ephemeral: true,
    })

    const inviteMessage = await interaction.channel.send({
      content: `${getMentionUsersString(invitedUsers)}, ${embedDescription}.`,
      embeds: [embed],
      components: [buttons],
    })

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

      await addOrUpdateParticipant(eventId, i.user.id, i.customId)
      selectedEvent = await fetchEvent(eventId)
      const participants = selectedEvent.participants

      const updatedEmbed = await createEventEmbed(selectedEvent, interaction.client)
      await inviteMessage.edit({ embeds: [updatedEmbed] })
      await i.deferUpdate()
    })

    buttonCollector.on('end', async () => {
      selectedEvent = await fetchEvent(eventId)
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
