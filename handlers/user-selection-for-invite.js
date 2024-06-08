const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { fetchEvent, addOrUpdateParticipant } = require('../services/eventService')

function getMentionUsersString(participantsIds) {
  const mentionUsers = participantsIds.map((discordID) => `<@${discordID}>`).join(', ')

  return mentionUsers
}

const handleUserSelection = async (interaction) => {
  const selectedUsers = interaction.values
  const eventId = interaction.customId.split(':')[1]
  const selectedEvent = await fetchEvent(eventId)

  const embedDescription = `You have been invited to the event ${selectedEvent.title} by ${interaction.user}.`
  const participantIDs = selectedEvent.participants.map((participant) => participant.discordID)
  const uniqueUsers = selectedUsers.filter((user) => !participantIDs.includes(user))

  for (const uniqueUser of uniqueUsers) {
    await addOrUpdateParticipant(eventId, uniqueUser, 'invited')
  }

  selectedEvent = await fetchEvent(eventId)
  participants = selectedEvent.participants

  const matchedParticipants = participants.filter((participant) => selectedUsers.includes(participant.discordID))
  const allUsersProcessed = matchedParticipants.length === selectedUsers.length
  const allSelectedUsersHaveResponded = matchedParticipants.every((participant) => participant.status !== 'invited')

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('attending').setLabel('Attend').setStyle('Success'),
    new ButtonBuilder().setCustomId('declined').setLabel('Decline').setStyle('Danger'),
    new ButtonBuilder().setCustomId('considering').setLabel('Considering').setStyle('Secondary')
  )

  const generateResponseText = () => {
    const statuses = [
      { label: 'Attending ✅:', status: 'attending' },
      { label: 'Declined ❌:', status: 'declined' },
      { label: 'Considering 🤔:', status: 'considering' },
      { label: 'Invited - awaiting response 🕐:', status: 'invited' },
    ]

    let responseText = `Event ID: ${eventId}\n\n`

    statuses.forEach(({ label, status }) => {
      responseText += `${label}\n`
      participants
        .filter((participant) => participant.status === status)
        .forEach((participant) => {
          responseText += `<@${participant.discordID}>\n`
        })
      responseText += '\n'
    })

    return responseText
  }

  const embed = new EmbedBuilder()
    .setTitle('Event Invitation')
    .setDescription(embedDescription)
    .addFields({ name: 'Responses', value: generateResponseText() })

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

    await addOrUpdateParticipant(eventId, i.user.id, i.customId)

    selectedEvent = await fetchEvent(eventId)
    participants = selectedEvent.participants

    const updatedEmbed = new EmbedBuilder()
      .setTitle('Event Invitation')
      .setDescription(embedDescription)
      .addFields({ name: 'Responses', value: generateResponseText() })

    await inviteMessage.edit({ embeds: [updatedEmbed] })

    await i.deferUpdate()
  })

  buttonCollector.on('end', async (collected) => {
    console.log(`Collected ${collected.size} button interactions.`)
    if (participants.unanswered.length > 0) {
      const newButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('attending').setLabel('Attend').setStyle('Success'),
        new ButtonBuilder().setCustomId('declined').setLabel('Decline').setStyle('Danger'),
        new ButtonBuilder().setCustomId('considering').setLabel('Considering').setStyle('Secondary')
      )

      await inviteMessage.edit({ components: [newButtons] })
    }
  })
}

module.exports = handleUserSelection
