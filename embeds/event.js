const { EmbedBuilder } = require('discord.js')
const { getLocalizedValue } = require('../utils/localization')

function formatBold(text) {
  return `**${text}**`
}

async function createEventEmbed({ event, client, language }) {
  const creator = await client.users.fetch(event.creator)
  const creatorAvatarUrl = creator.displayAvatarURL()
  const botUser = client.user
  const botAvatarUrl = botUser.displayAvatarURL()

  const status = getLocalizedValue(language, 'status')
  const commons = getLocalizedValue(language, 'commons')
  const eventStatus = getLocalizedValue(language, 'eventStatus')

  const statuses = [
    { label: status.attending + ' ✅:', status: 'attending' },
    { label: status.decline + ' ❌:', status: 'declined' },
    { label: status.considering + ' 🤔:', status: 'considering' },
    { label: status.invited + ' 🕐:', status: 'invited' },
    { label: status.waitlist + ' 📝:', status: 'waitlist' },
  ]

  const statusEmojis = {
    'not-started': '⏳',
    'ready-to-start': '🚀',
    ongoing: '🔄',
    finished: '✅',
    canceled: '❌',
  }

  const eventStatusText = {
    'not-started': 'notStarted',
    'ready-to-start': 'readyToStart',
    ongoing: 'ongoing',
    finished: 'finished',
    canceled: 'canceled',
  }

  let responseText = formatBold(commons.eventId + ':') + ` ${event._id}\n`
  // TODO bu localeString'e de şey ver işte interaction.locale
  responseText +=
    formatBold(commons.startTime + ':') +
    ` ${new Date(event.startTime).toLocaleString(language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}\n`

  responseText +=
    formatBold(commons.participants + ':') +
    ` ${event.users.filter((user) => user.status === 'attending').length}/${event.participantLimit}\n`
  responseText +=
    formatBold(commons.status + ':') +
    ` ${statusEmojis[event.status] || ''} ${eventStatus[eventStatusText[event.status]]}\n\n`

  const waitlistUsers = event.users.filter((user) => user.status === 'waitlist')
  const showWaitlist = waitlistUsers.length > 0

  if (showWaitlist) {
    const attendingUsers = event.users.filter((user) => user.status === 'attending')
    responseText +=
      formatBold(status.attending + ' ✅:') + `\n${attendingUsers.map((user) => `<@${user.discordID}>`).join(', ')}\n\n`
    responseText += formatBold(commons.status + ':') + formatBold(status.waitlist + ' 📝:')`\n`
    waitlistUsers.forEach((user, index) => {
      responseText += `${index + 1}. <@${user.discordID}>\n`
    })
  } else {
    statuses.forEach(({ label, status }) => {
      if (status !== 'waitlist') {
        responseText += `**${label}**\n`
        const participantsString = event.users
          .filter((user) => user.status === status)
          .map((user) => `<@${user.discordID}>`)
          .join(', ')
        responseText += `${participantsString}\n\n`
      }
    })
  }

  responseText += '\u200B\n'

  if (responseText.length > 1024) {
    const truncatedText = responseText.substring(0, 1024)
    const lastCommaIndex = truncatedText.lastIndexOf(',')
    responseText = truncatedText.substring(0, lastCommaIndex) + ', ...'
  }

  const thisEventIsCreatedBy = getLocalizedValue(language, 'dynamic.thisEventIsCreatedBy', {
    'creator.username': creator.username,
  })

  return new EmbedBuilder()
    .setColor(0xb8c4f8)
    .setTitle(event.title)
    .setDescription(event.description || commons.noDescription)
    .setThumbnail(botAvatarUrl)
    .addFields({ name: commons.details, value: responseText })
    .setTimestamp(new Date(event.createdAt))
    .setFooter({ text: thisEventIsCreatedBy, iconURL: creatorAvatarUrl })
}

module.exports = { createEventEmbed }
