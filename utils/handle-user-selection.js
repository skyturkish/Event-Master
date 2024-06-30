const { fetchEvent, addOrUpdateUser } = require('../services/event-service')
const { getMentionUsersString, getUsersName } = require('../utils/mentionUtils')
const { handleEventAction } = require('./handle-event-action')

const handleUserSelection = async (interaction, eventId) => {
  let selectedUsers = interaction.values
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
      selectedUsers = await getUsersName(selectedUsers, interaction.client)

      await handleEventAction(
        interaction,
        'invite-event',
        eventId,
        `All the users you invited have already responded and were not re-invited: ${selectedUsers}. Please check the list below for the current status.`
      )

      return
    }

    const invitedUsers = users
      .filter((user) => selectedUsers.includes(user.discordID) && user.status === 'invited')
      .map((user) => user.discordID)

    const notInvitedUsers = await getUsersName(
      users
        .filter((user) => selectedUsers.includes(user.discordID) && user.status !== 'invited')
        .map((user) => user.discordID),
      interaction.client
    )

    let content = `The following users have been successfully invited to the event: ${getMentionUsersString(
      invitedUsers
    )}.`

    if (notInvitedUsers.length > 0) {
      content += ` However, the following users had already responded to the invitation and were not re-invited: ${notInvitedUsers}. Please check the list below for their current status.`
    }

    await handleEventAction(interaction, 'invite-event', eventId, content)
  } catch (error) {
    console.log('Error inviting users to event', error)
    await interaction.reply({
      content: error.response.data.error || 'An error occurred while processing your request.',
      ephemeral: true,
    })
  }
}

module.exports = {
  handleUserSelection,
}
