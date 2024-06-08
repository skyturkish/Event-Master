const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { fetchEvent, addOrUpdateParticipant } = require('../services/eventService')

const handleUserSelection = async (interaction) => {
  const selectedUsers = interaction.values
  const eventId = interaction.customId.split(':')[1]
  const selectedEvent = await fetchEvent(eventId)

  const existingParticipants = selectedEvent.participants.reduce((acc, participant) => {
    acc[participant.status] = acc[participant.status] || []
    acc[participant.status].push(participant.discordID)
    return acc
  }, {})

  const newParticipants = selectedUsers.filter(
    (userId) => !selectedEvent.participants.some((participant) => participant.discordID === userId)
  )

  for (const userId of newParticipants) {
    await addOrUpdateParticipant(eventId, userId, 'invited')
  }

  const mentionUsers = newParticipants.map((userId) => `<@${userId}>`).join(', ')

  const embedDescription = `You have been invited to the event ${selectedEvent.title} by ${interaction.user}.`

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('attending').setLabel('Attend').setStyle('Success'),
    new ButtonBuilder().setCustomId('declined').setLabel('Decline').setStyle('Danger'),
    new ButtonBuilder().setCustomId('considering').setLabel('Considering').setStyle('Secondary')
  )

  const responses = {
    attending: existingParticipants.attending || [],
    declined: existingParticipants.declined || [],
    considering: existingParticipants.considering || [],
    unanswered: existingParticipants.invited
      ? existingParticipants.invited.concat(newParticipants)
      : [...newParticipants],
  }

  const generateResponseText = () => {
    let responseText = `Event ID: ${eventId}\n\nAttending ✅:\n`
    responses.attending.forEach((userId) => {
      responseText += `<@${userId}>\n`
    })

    responseText += '\nDeclined ❌:\n'
    responses.declined.forEach((userId) => {
      responseText += `<@${userId}>\n`
    })

    responseText += '\nConsidering 🤔:\n'
    responses.considering.forEach((userId) => {
      responseText += `<@${userId}>\n`
    })

    responseText += '\nInvited - awaiting response 🕐:\n'
    responses.unanswered.forEach((userId) => {
      responseText += `<@${userId}>\n`
    })

    return responseText
  }

  const embed = new EmbedBuilder()
    .setTitle('Event Invitation')
    .setDescription(embedDescription)
    .addFields({ name: 'Responses', value: generateResponseText() })

  const inviteMessage = await interaction.channel.send({
    content: `${mentionUsers}, ${embedDescription}.`,
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

    responses.attending = responses.attending.filter((userId) => userId !== i.user.id)
    responses.declined = responses.declined.filter((userId) => userId !== i.user.id)
    responses.considering = responses.considering.filter((userId) => userId !== i.user.id)
    responses.unanswered = responses.unanswered.filter((userId) => userId !== i.user.id)

    if (i.customId === 'attending') {
      responses.attending.push(i.user.id)
    } else if (i.customId === 'declined') {
      responses.declined.push(i.user.id)
    } else if (i.customId === 'considering') {
      responses.considering.push(i.user.id)
    }

    const updatedEmbed = new EmbedBuilder()
      .setTitle('Event Invitation')
      .setDescription(embedDescription)
      .addFields({ name: 'Responses', value: generateResponseText() })

    await inviteMessage.edit({ embeds: [updatedEmbed] })

    await i.deferUpdate()
  })

  buttonCollector.on('end', async (collected) => {
    console.log(`Collected ${collected.size} button interactions.`)
    if (responses.unanswered.length > 0) {
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
