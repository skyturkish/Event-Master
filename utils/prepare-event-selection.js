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
      await interaction.reply({ content: 'No events available to invite to.', ephemeral: true })
      return
    }
  } else if (commandName === 'join-event') {
    events = await fetchEventsByCriteria({
      guild: interaction.guild.id,
      status: 'not-started',
    })
    if (events.length === 0) {
      await interaction.reply({ content: 'No events available to join.', ephemeral: true })
      return
    }
  } else if (commandName === 'leave-event') {
    events = await fetchEventsByCriteria({
      guild: interaction.guild.id,
      status: 'not-started',
      participantDiscordID: interaction.user.id,
      participantStatus: 'attending',
    })
    if (events.length === 0) {
      await interaction.reply({ content: 'You are not participating in any events to leave.', ephemeral: true })
      return
    }
  } else if (commandName === 'update-event') {
    events = await fetchEventsByCriteria({
      guild: interaction.guild.id,
      status: 'not-started',
      creator: interaction.user.id,
    })
    if (events.length === 0) {
      await interaction.reply({ content: 'You are not hosting any events to update.', ephemeral: true })
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
