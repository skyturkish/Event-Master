const { fetchEventsByCriteria, fetchEvent, addOrUpdateParticipant } = require('../services/event-service')
const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')
const { ActionRowBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } = require('discord.js')

async function prepareEventSelection(interaction, commandName) {
  let events

  if (commandName === 'invite-event') {
    events = await fetchEventsByCriteria({ guild: interaction.guild.id, status: 'not-started' })
    if (events.length === 0) {
      await interaction.reply({ content: 'No events available to invite to.', ephemeral: true })
      return
    }
  } else if (commandName === 'join-event') {
    events = await fetchEventsByCriteria({ guild: interaction.guild.id, status: 'not-started' })
    if (events.length === 0) {
      await interaction.reply({ content: 'No events available to join.', ephemeral: true })
      return
    }
  } else if (commandName === 'leave-event') {
    events = await fetchEventsByCriteria({
      guild: interaction.guild.id,
      status: 'not-started',
      participantDiscordID: interaction.user.id,
    })
    if (events.length === 0) {
      await interaction.reply({ content: 'You are not participating in any events to leave.', ephemeral: true })
      return
    }
  }

  const eventOptions = events.map((event) => ({
    label: event.title,
    description: event.description,
    value: event._id,
  }))

  const eventRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select-event-for-:${commandName}`)
      .setPlaceholder('Select an event')
      .addOptions(eventOptions)
  )

  await interaction.reply({ content: 'Please select an event:', components: [eventRow], ephemeral: true })
}

async function prepareUserSelection(interaction, eventId) {
  const event = await fetchEvent(eventId)

  const participantLimit = event.participantLimit
  const maxValues = Math.min(participantLimit, 25)

  const userRow = new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`select-users-for-invite:${event._id}`)
      .setPlaceholder('Select users to invite')
      .setMinValues(1)
      .setMaxValues(maxValues)
  )

  await interaction.update({
    content: `Event "${event.title}" selected. Now, select users to invite:`,
    components: [userRow],
    ephemeral: true,
  })
}

function getMentionUsersString(participantsIds) {
  return participantsIds.map((discordID) => `<@${discordID}>`).join(', ')
}

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

async function handleEventSelection(interaction, action, eventId) {
  let event = await fetchEvent(eventId)

  const embed = await createEventEmbed(event, interaction.client)
  const buttons = createButtons()

  const responseMessage = await interaction.reply({
    content: `You have ${action}ed the event "${event.title}". Please confirm your participation status below.`,
    embeds: [embed],
    components: [buttons],
    ephemeral: action == 'invite-event' ? false : true,
    fetchReply: true,
  })

  const buttonFilter = (i) =>
    ['attending', 'declined', 'considering'].includes(i.customId) && i.user.id === interaction.user.id
  const buttonCollector = responseMessage.createMessageComponentCollector({
    filter: buttonFilter,
    time: 3 * 24 * 60 * 60 * 1000,
  }) // 3 days

  buttonCollector.on('collect', async (i) => {
    if (event.status !== 'not-started') {
      const statusMessages = {
        ongoing: 'This event is currently ongoing, you can no longer make a decision.',
        finished: 'This event has already finished, you can no longer make a decision.',
        canceled: 'This event has been canceled, you can no longer make a decision.',
      }

      const messageContent = statusMessages[event.status] || 'You can no longer make a decision for this event.'

      await i.reply({
        content: messageContent,
        ephemeral: true,
      })
      return
    }

    await addOrUpdateParticipant(eventId, i.user.id, i.customId)
    event = await fetchEvent(eventId)
    const updatedEmbed = await createEventEmbed(event, interaction.client)

    await i.update({ embeds: [updatedEmbed], components: [buttons], ephemeral: true })
  })

  buttonCollector.on('end', async () => {
    event = await fetchEvent(eventId)
    const updatedEmbed = await createEventEmbed(event, interaction.client)

    await responseMessage.edit({ embeds: [updatedEmbed], components: [], ephemeral: true })
  })
}

module.exports = {
  prepareEventSelection,
  handleEventSelection,
  prepareUserSelection,
  handleUserSelection,
}
