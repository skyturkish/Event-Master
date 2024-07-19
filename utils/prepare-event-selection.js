const { fetchEventsByCriteria } = require('../services/event-service')
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

async function getEventsByCommand(commandName, guildId, userId) {
  const criteriaMap = {
    'invite-event': { guild: guildId, status: 'not-started' },
    'join-event': { guild: guildId, status: 'not-started' },
    'leave-event': { guild: guildId, status: 'not-started', userDiscordID: userId, userStatus: 'attending' },
    'update-event': { guild: guildId, status: 'not-started', creator: userId },
    'cancel-event': { guild: guildId, status: 'not-started', creator: userId },
    'start-event': [
      { guild: guildId, status: 'not-started', creator: userId },
      { guild: guildId, status: 'ready-to-start', creator: userId },
    ],
    'finish-event': { guild: guildId, status: 'ongoing', creator: userId },
  }

  if (commandName === 'start-event') {
    const [notStartedEvents, readyEvents] = await Promise.all(
      criteriaMap[commandName].map((criteria) => fetchEventsByCriteria(criteria))
    )
    return notStartedEvents.concat(readyEvents)
  }

  return fetchEventsByCriteria(criteriaMap[commandName])
}

function getEmptyEventMessage(commandName) {
  const messageMap = {
    'invite-event':
      'No events available to invite to. You can create an event with /create-event. For more information, use /help.',
    'join-event':
      'No events available to join. You can create an event with /create-event. For more information, use /help.',
    'leave-event':
      'You are not participating in any events to leave. Check available events with /events. For more information, use /help.',
    'update-event':
      'You can only update events that have not started yet. Maybe your events have already started or finished. Check with /events. For more information, use /help.',
    'cancel-event':
      'You can only update events that have not started yet. Maybe your events have already started or finished. Check with /events. For more information, use /help.',
    'start-event':
      'You can only start events that have not started yet. Maybe your events have already started or finished. Check with /events. For more information, use /help.',
    'finish-event':
      'You can only finish events that are ongoing. Maybe your events have not started yet or have already finished. Check with /events. For more information, use /help.',
  }

  return messageMap[commandName]
}

function getSelectionPromptMessage(commandName) {
  const messageMap = {
    'invite-event': 'Please select an event to invite others to:',
    'join-event': 'Please select an event to join:',
    'leave-event': 'Please select an event to leave:',
    'update-event': 'Please select an event to update:',
    'cancel-event': 'Please select an event to cancel:',
    'start-event': 'Please select an event to start:',
    'finish-event': 'Please select an event to finish:',
  }

  return messageMap[commandName]
}

async function prepareEventSelection(interaction, commandName) {
  const events = await getEventsByCommand(commandName, interaction.guild.id, interaction.user.id)

  if (events.length === 0) {
    await interaction.reply({
      content: getEmptyEventMessage(commandName),
      ephemeral: true,
    })
    return
  }

  const eventOptions = events.map((event) => ({
    label: event.title,
    description: `Start: ${new Date(event.startTime).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })} - ${event.description}`.substring(0, 100),
    value: event._id,
    emoji: '📅',
  }))

  const eventRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select-event-for-:${commandName}`)
      .setPlaceholder('Select an event')
      .addOptions(eventOptions)
  )

  try {
    await interaction.reply({
      content: getSelectionPromptMessage(commandName),
      components: [eventRow],
      ephemeral: true,
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  prepareEventSelection,
}
