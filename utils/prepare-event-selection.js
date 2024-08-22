const { fetchEventsByCriteria } = require('../services/event-service')
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')
const { getLocalizedValue } = require('../utils/localization')

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
    'update-event': { guild: guildId, statuses: ['not-started', 'ready-to-start'], creator: userId },
    'cancel-event': { guild: guildId, statuses: ['not-started'], creator: userId },
    'start-event': { guild: guildId, statuses: ['ready-to-start'], creator: userId },
    'finish-event': { guild: guildId, statuses: ['ongoing'], creator: userId },
    events: { guild: guildId, statuses: ['not-started', 'ready-to-start', 'ongoing'] },
    'active-events': { guild: guildId, statuses: ['not-started', 'ready-to-start', 'ongoing'] },
  }
  return criteriaMap[commandName]
}

function getSelectionPromptMessage(commandName, language) {
  const selections = getLocalizedValue(language, 'selections')

  const messageMap = {
    'invite-event': selections.inviteEvent,
    'join-event': selections.joinEvent,
    'leave-event': selections.leaveEvent,
    'update-event': selections.updateEvent,
    'cancel-event': selections.cancelEvent,
    'start-event': selections.startEvent,
    'finish-event': selections.finishEvent,
    events: selections.events,
    'active-events': selections.activeEvents,
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

    const statusOrder = ['not-started', 'ready-to-start', 'ongoing', 'finished', 'canceled']
    // Sort on backend to avoid sorting on frontend
    events.sort((b, a) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))

    const eventOptions = events.map((event) => ({
      label: event.title,
      description: `Start: ${new Date(event.startTime).toLocaleString(interaction.locale, {
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

    const selectAnEvent = getLocalizedValue(interaction.locale, 'commons.selectAnEvent')

    const eventRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`select-event-for-:${commandName}`)
        .setPlaceholder(selectAnEvent)
        .addOptions(eventOptions)
    )

    await interaction.reply({
      content: getSelectionPromptMessage(commandName, interaction.locale),
      components: [eventRow],
      ephemeral: true,
    })
  } catch (error) {
    console.log('prepareEventSelection error:', error)

    const noEvents = getLocalizedValue(interaction.locale, 'noEvents')

    content = getLocalizedValue(interaction.locale, 'anErrorOccurredWhileFetchingTheEvents')

    if (error.response && error.response.data && error.response.data.error == 'noEventsFound') {
      const contentMap = {
        'invite-event': noEvents.inviteEvent,
        'join-event': noEvents.joinEvent,
        'leave-event': noEvents.leaveEvent,
        'update-event': noEvents.updateEvent,
        'cancel-event': noEvents.cancelEvent,
        'start-event': noEvents.startEvent,
        'finish-event': noEvents.finishEvent,
        events: noEvents.events,
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
