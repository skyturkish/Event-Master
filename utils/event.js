const { fetchEventsByGuild, fetchEvent, addOrUpdateParticipant } = require('../services/eventService')
const { createEventEmbed } = require('../embeds/event')
const { createButtons } = require('../components/buttons')
const { ActionRowBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } = require('discord.js')

async function prepareEventSelection(interaction, commandName) {
  // commandName'e göre listeyi daraltacaksın
  const events = await fetchEventsByGuild(interaction.guildId)

  if (events.length === 0) {
    await interaction.reply({ content: 'No events available.', ephemeral: true })
    return
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
  const events = await fetchEventsByGuild(interaction.guildId)

  const selectedEvent = events.find((event) => event._id === eventId)

  const participantLimit = selectedEvent.participantLimit
  const maxValues = Math.min(participantLimit, 25)

  const userRow = new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`select-users-for-invite:${selectedEvent._id}`)
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

function getMentionUsersString(participantsIds) {
  return participantsIds.map((discordID) => `<@${discordID}>`).join(', ')
}

const handleUserSelection = async (interaction, eventId) => {
  const selectedUsers = interaction.values
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
  let selectedEvent = await fetchEvent(eventId)

  const embed = await createEventEmbed(selectedEvent, interaction.client)
  const buttons = createButtons()

  const responseMessage = await interaction.reply({
    content: `You have ${action}ed the event "${selectedEvent.title}". Please confirm your participation status below.`,
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
    const updatedEmbed = await createEventEmbed(selectedEvent, interaction.client)

    await i.update({ embeds: [updatedEmbed], components: [buttons], ephemeral: true })
  })

  buttonCollector.on('end', async () => {
    selectedEvent = await fetchEvent(eventId)
    const updatedEmbed = await createEventEmbed(selectedEvent, interaction.client)

    await responseMessage.edit({ embeds: [updatedEmbed], components: [], ephemeral: true })
  })
}

module.exports = {
  prepareEventSelection,
  handleEventSelection,
  prepareUserSelection,
  handleUserSelection,
}
