const { EmbedBuilder } = require('discord.js')

async function createEventEmbed(event, client) {
  const creator = await client.users.fetch(event.creator)
  const creatorAvatarUrl = creator.displayAvatarURL()
  const botUser = client.user
  const botAvatarUrl = botUser.displayAvatarURL()

  const statuses = [
    { label: 'Attending ✅:', status: 'attending' },
    { label: 'Declined ❌:', status: 'declined' },
    { label: 'Considering 🤔:', status: 'considering' },
    { label: 'Invited - awaiting response 🕐:', status: 'invited' },
    { label: 'Waitlist 📝:', status: 'waitlist' },
  ]

  let responseText = `**Event ID:** ${event._id}\n`
  responseText += `**Start Time:** ${new Date(event.startTime).toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}\n`
  responseText += `**Participants:** ${event.users.filter((user) => user.status === 'attending').length}/${
    event.participantLimit
  }\n\n`

  const waitlistUsers = event.users.filter((user) => user.status === 'waitlist')
  const showWaitlist = waitlistUsers.length > 0

  if (showWaitlist) {
    const attendingUsers = event.users.filter((user) => user.status === 'attending')
    responseText += `**Attending ✅:**\n${attendingUsers.map((user) => `<@${user.discordID}>`).join(', ')}\n\n`
    responseText += `**Waitlist 📝:**\n`
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

  return new EmbedBuilder()
    .setColor(0xb8c4f8)
    .setTitle(event.title)
    .setDescription(event.description)
    .setThumbnail(botAvatarUrl)
    .addFields({ name: 'Details', value: responseText })
    .setTimestamp()
    .setFooter({ text: `This event is created by ${creator.username}`, iconURL: creatorAvatarUrl })
}

module.exports = { createEventEmbed }
