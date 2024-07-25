const { updateEvent, fetchEvent } = require('../services/event-service')
const { getMentionUsersString } = require('../utils/mentionUtils')

const handleEventCancel = async (interaction, eventId) => {
  try {
    await updateEvent(eventId, { status: 'canceled' })
    const event = await fetchEvent(eventId)

    await interaction.channel.send({
      content: `Sorry, the event "${event.title}" you were going to attend has been canceled by <@${
        event.creator
      }>. Here are the participants who were going to attend: ${getMentionUsersString(
        event.users.filter((user) => user.status === 'attending').map((user) => user.discordID)
      )}`,
    })
  } catch (error) {
    await interaction.reply({
      content: error.response.data.error,
      ephemeral: true,
    })
  }
}

module.exports = {
  handleEventCancel,
}
