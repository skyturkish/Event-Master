const { fetchEventsByCriteria, fetchEvent } = require('../services/event-service')
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

async function prepareEventSelection(interaction, commandName) {
  let events

  if (commandName === 'invite-event') {
    events = await fetchEventsByCriteria({
      guild: interaction.guild.id,
      status: 'not-started',
    })
    if (events.length === 0) {
      await interaction.reply({
        content:
          'No events available to invite to. You can create an event with /create-event. For more information, use /help.',
        ephemeral: true,
      })
      return
    }
  } else if (commandName === 'join-event') {
    events = await fetchEventsByCriteria({
      guild: interaction.guild.id,
      status: 'not-started',
    })
    if (events.length === 0) {
      await interaction.reply({
        content:
          'No events available to join. You can create an event with /create-event. For more information, use /help.',
        ephemeral: true,
      })
      return
    }
  } else if (commandName === 'leave-event') {
    events = await fetchEventsByCriteria({
      guild: interaction.guild.id,
      status: 'not-started',
      userDiscordID: interaction.user.id,
      userStatus: 'attending',
    })
    if (events.length === 0) {
      await interaction.reply({
        content:
          'You are not participating in any events to leave. Check available events with /events. For more information, use /help.',
        ephemeral: true,
      })
      return
    }
  } else if (commandName === 'update-event') {
    events = await fetchEventsByCriteria({
      guild: interaction.guild.id,
      status: 'not-started',
      creator: interaction.user.id,
    })
    if (events.length === 0) {
      await interaction.reply({
        content:
          'You can only update events that have not started yet. Maybe your events have already started or finished. Check with /events. For more information, use /help.',
        ephemeral: true,
      })
      return
    }
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

  await interaction.reply({ content: 'Please select an event:', components: [eventRow], ephemeral: true })
}

module.exports = {
  prepareEventSelection,
}
