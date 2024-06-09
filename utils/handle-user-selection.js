
const { fetchEvent, addOrUpdateParticipant } = require('../services/event-service')
const { getMentionUsersString } = require('../utils/mentionUtils')

const handleUserSelection = async (interaction, eventId) => {
  const selectedUsers = interaction.values
  let event = await fetchEvent(eventId)
  const embedDescription = `You have been invited to the event ${event.title} by ${interaction.user}.`
  const participantIDs = event.participants.map((participant) => participant.discordID)
  const uniqueUsers = selectedUsers.filter((user) => !participantIDs.includes(user))

  try {
    for (const uniqueUser of uniqueUsers) {
      await addOrUpdateParticipant(eventId, uniqueUser, 'invited')
    }

    event = await fetchEvent(eventId)
    const participants = event.participants
    const matchedParticipants = participants.filter((participant) => selectedUsers.includes(participant.discordID))
    const allUsersProcessed = matchedParticipants.length === selectedUsers.length
    const allSelectedUsersHaveResponded = matchedParticipants.every((participant) => participant.status !== 'invited')

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

    await handleEventSelection(interaction, 'invite-event', eventId)
  } catch (error) {
    console.error('Error handling user selection:', error)
    await interaction.reply({
      content: 'There was an error handling your selection. Please try again later.',
      ephemeral: true,
    })
  }
}

module.exports = {
  handleUserSelection,
}
