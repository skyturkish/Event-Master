const { ActionRowBuilder, ButtonBuilder } = require('discord.js')

function createButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('attending').setLabel('Attend').setStyle('Success'),
    new ButtonBuilder().setCustomId('declined').setLabel('Decline').setStyle('Danger'),
    new ButtonBuilder().setCustomId('considering').setLabel('Considering').setStyle('Secondary')
  )
}

module.exports = { createButtons }
