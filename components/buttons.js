const { ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { getLocalizedValue } = require('../utils/localization')

function createButtons({ language }) {
  const buttons = getLocalizedValue(language, 'buttons')

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('attending').setLabel(buttons.attend).setStyle('Success'),
    new ButtonBuilder().setCustomId('declined').setLabel(buttons.decline).setStyle('Danger'),
    new ButtonBuilder().setCustomId('considering').setLabel(buttons.considering).setStyle('Secondary')
  )
}

module.exports = { createButtons }
