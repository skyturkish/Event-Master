const { fetchEventsByCriteria } = require('../services/event-service')
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

function getCriteria(commandName, guildId, userId) {
  const criteriaMap = {
    'invite-event': { guild: guildId, statuses: ['not-started', 'ready-to-start'] },
    'join-event': { guild: guildId, statuses: ['not-started', 'ready-to-start'] },
    'leave-event': {
      guild: guildId,
      statuses: ['not-started', 'ready-to-start'],
      userDiscordID: userId,
      userStatus: 'attending',
    },
    'update-event': { guild: guildId, statuses: ['not-started'], creator: userId },
    'cancel-event': { guild: guildId, statuses: ['not-started'], creator: userId },
    'start-event': { guild: guildId, statuses: ['ready-to-start'], creator: userId },
    'finish-event': { guild: guildId, statuses: ['ongoing'], creator: userId },
    events: { guild: guildId, statuses: ['not-started', 'ready-to-start', 'ongoing', 'finished'] },
  }
  return criteriaMap[commandName]
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
    events: 'Please select an event to view:',
  }

  return messageMap[commandName]
}

async function prepareEventSelection(interaction, commandName) {
  try {
    const criteria = getCriteria(commandName, interaction.guild.id, interaction.user.id)

    const events = await fetchEventsByCriteria(criteria)

    const statusEmojis = {
      'not-started': '⏳',
      'ready-to-start': '🚀',
      ongoing: '🔄',
      finished: '✅',
      canceled: '❌',
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
      emoji: statusEmojis[event.status] || '📅',
    }))

    const eventRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`select-event-for-:${commandName}`)
        .setPlaceholder('Select an event')
        .addOptions(eventOptions)
    )

    await interaction.reply({
      content: getSelectionPromptMessage(commandName),
      components: [eventRow],
      ephemeral: true,
    })
  } catch (error) {
    console.log('prepareEventSelection error:', error)

    content = 'An error occurred while fetching the events.'

    if (error.response && error.response.data && error.response.data.error === 'No events found') {
      const contentMap = {
        'invite-event': 'No events available to invite others to.',
        'join-event': 'No events available to join.',
        'leave-event': 'No events available to leave.',
        'update-event': 'No events available to update.',
        'cancel-event': 'No events available to cancel.',
        'start-event': 'No events available to start.',
        'finish-event': 'No events available to finish.',
      }
      content = contentMap[commandName]
    }

    await interaction.reply({
      content,
      ephemeral: true,
    })
  }
}

module.exports = {
  prepareEventSelection,
}
