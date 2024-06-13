const { fetchEvent, addOrUpdateUser } = require('../services/event-service')
const { getMentionUsersString } = require('../utils/mentionUtils')
const { handleEventAction } = require('./handle-event-selection')

const handleUserSelection = async (interaction, eventId) => {
  const selectedUsers = interaction.values
  let event = await fetchEvent(eventId)
  const embedDescription = `You have been invited to the event ${event.title} by ${interaction.user}.`
  const userIDs = event.users.map((user) => user.discordID)
  const uniqueUsers = selectedUsers.filter((user) => !userIDs.includes(user))

  try {
    for (const uniqueUser of uniqueUsers) {
      await addOrUpdateUser(eventId, uniqueUser, 'invited')
    }

    event = await fetchEvent(eventId)
    const users = event.users
    const matchedUsers = users.filter((user) => selectedUsers.includes(user.discordID))
    const allUsersProcessed = matchedUsers.length === selectedUsers.length
    const allSelectedUsersHaveResponded = matchedUsers.every((user) => user.status !== 'invited')

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

    const invitedUsers = users
      .filter((user) => selectedUsers.includes(user.discordID) && user.status === 'invited')
      .map((user) => user.discordID)

    const notInvitedUsers = users
      .filter((user) => selectedUsers.includes(user.discordID) && user.status !== 'invited')
      .map((user) => user.discordID)

    let content = `The following users have been successfully invited to the event: ${getMentionUsersString(
      invitedUsers
    )}.`

    if (notInvitedUsers.length > 0) {
      content += ` However, the following users had already responded to the invitation and were not re-invited: ${getMentionUsersString(
        notInvitedUsers
      )}. Please check the list below for their current status.`
    }

    await handleEventAction(interaction, 'invite-event', eventId)
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
