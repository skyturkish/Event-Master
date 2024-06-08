const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, UserSelectMenuBuilder } = require('discord.js')
const { fetchEventsByGuild, fetchEvent, addOrUpdateParticipant } = require('../services/eventService')

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
      }
      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`)
        console.error(error)
      }
    }

    if (!interaction.isStringSelectMenu() && !interaction.isButton() && !interaction.isUserSelectMenu()) return

    if (interaction.customId === 'select-event-for-invite') {
      const events = await fetchEventsByGuild(interaction.guildId)
      const selectedEvent = events.find((event) => event._id === interaction.values[0])

      const participantLimit = selectedEvent.participantLimit
      const maxValues = Math.min(participantLimit, 25)

      const userRow = new ActionRowBuilder().addComponents(
        new UserSelectMenuBuilder()
          .setCustomId(`select-users:${selectedEvent._id}`)
          .setPlaceholder('Select users to invite')
          .setMinValues(1)
          .setMaxValues(maxValues)
      )

      await interaction.update({
        content: `Event "${selectedEvent.title}" selected. Now, select users to invite:`,
        components: [userRow],
        ephemeral: true,
      })
    }

    if (interaction.customId.startsWith('select-users:')) {
      const selectedUsers = interaction.values
      const eventId = interaction.customId.split(':')[1]
      const selectedEvent = await fetchEvent(eventId)

      // Extract participants from the event and group by status
      const existingParticipants = selectedEvent.participants.reduce((acc, participant) => {
        acc[participant.status] = acc[participant.status] || []
        acc[participant.status].push(participant.discordID)
        return acc
      }, {})

      // Filter out users who are already participants
      const newParticipants = selectedUsers.filter(
        (userId) => !selectedEvent.participants.some((participant) => participant.discordID === userId)
      )

      // Update participants in the event
      for (const userId of newParticipants) {
        await addOrUpdateParticipant(eventId, userId, 'invited')
      }

      const mentionUsers = newParticipants.map((userId) => `<@${userId}>`).join(', ')

      const embedDescription = `You have been invited to the event ${selectedEvent.title} by ${interaction.user}.`

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('accepted').setLabel('Accept').setStyle('Success'),
        new ButtonBuilder().setCustomId('declined').setLabel('Decline').setStyle('Danger'),
        new ButtonBuilder().setCustomId('maybe').setLabel('Maybe').setStyle('Secondary')
      )

      const responses = {
        accepted: existingParticipants.accepted || [],
        declined: existingParticipants.declined || [],
        maybe: existingParticipants.maybe || [],
        unanswered: existingParticipants.invited
          ? existingParticipants.invited.concat(newParticipants)
          : [...newParticipants],
      }

      const generateResponseText = () => {
        let responseText = `Event ID: ${eventId}\n\nAccepted ✅:\n`
        responses.accepted.forEach((userId) => {
          responseText += `<@${userId}>\n`
        })

        responseText += '\nDeclined ❌:\n'
        responses.declined.forEach((userId) => {
          responseText += `<@${userId}>\n`
        })

        responseText += '\nMaybe 🤔:\n'
        responses.maybe.forEach((userId) => {
          responseText += `<@${userId}>\n`
        })

        responseText += '\nUnanswered 🕐:\n'
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

      const buttonFilter = (i) => ['accepted', 'declined', 'maybe'].includes(i.customId) // Remove the restriction to newParticipants

      const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000 // 2 gün

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

        // Remove the user from all response categories before adding them to the new one
        responses.accepted = responses.accepted.filter((userId) => userId !== i.user.id)
        responses.declined = responses.declined.filter((userId) => userId !== i.user.id)
        responses.maybe = responses.maybe.filter((userId) => userId !== i.user.id)
        responses.unanswered = responses.unanswered.filter((userId) => userId !== i.user.id)

        if (i.customId === 'accepted') {
          responses.accepted.push(i.user.id)
        } else if (i.customId === 'declined') {
          responses.declined.push(i.user.id)
        } else if (i.customId === 'maybe') {
          responses.maybe.push(i.user.id)
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
            new ButtonBuilder().setCustomId('accepted').setLabel('Accept').setStyle('Success'),
            new ButtonBuilder().setCustomId('declined').setLabel('Decline').setStyle('Danger'),
            new ButtonBuilder().setCustomId('maybe').setLabel('Maybe').setStyle('Secondary')
          )

          await inviteMessage.edit({ components: [newButtons] })
        }
      })
    }
  },
}
