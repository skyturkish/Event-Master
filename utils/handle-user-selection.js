const { fetchEvent, addOrUpdateUser } = require('../services/event-service')
const { getMentionUsersString, getUsersName } = require('../utils/mentionUtils')
const { handleEventAction } = require('./handle-event-action')
const { getLocalizedValue } = require('../utils/localization')

const handleUserSelection = async (interaction, eventId) => {
  let selectedUsers = interaction.values
  let event = await fetchEvent(eventId)
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

      const allTheUsersYouInvitedHaveAlreadyResponded = getLocalizedValue(
        interaction.locale,
        'dynamic.allTheUsersYouInvitedHaveAlreadyResponded',
        {
          selectedUsers,
        }
      )

      await handleEventAction(interaction, 'invite-event', eventId, allTheUsersYouInvitedHaveAlreadyResponded)

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

    let content = getLocalizedValue(interaction.locale, 'dynamic.theFollowingUsersHaveBeenSuccessfullyInvited', {
      invitedUsers: getMentionUsersString(invitedUsers),
    })

    if (notInvitedUsers.length > 0) {
      content += getLocalizedValue(interaction.locale, 'dynamic.howeverTheFollowingUsersHadAlreadyResponded', {
        notInvitedUsers,
      })
    }

    await handleEventAction(interaction, 'invite-event', eventId, content)
  } catch (error) {
    console.log('Error inviting users to event', error)

    let errorMessage = getLocalizedValue(interaction.locale, 'anErrorOccurredWhileProcessingYourRequest')

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
  handleUserSelection,
}
