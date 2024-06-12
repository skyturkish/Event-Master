const { prepareUserSelection } = require('../utils/prepare-user-selection')
const { handleEventSelection } = require('../utils/handle-event-selection')
const { handleUserSelection } = require('../utils/handle-user-selection')
const { handleEventUpdate } = require('../utils/handle-event-update')
const { handleEventCancel } = require('../utils/handle-event-cancel')
const { Events } = require('discord.js')

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
      }
      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`)
        console.error(error)
      }
    }

    if (!interaction.isStringSelectMenu() && !interaction.isButton() && !interaction.isUserSelectMenu()) return

    if (interaction.customId.startsWith('select-event-for-:')) {
      const commandName = interaction.customId.split(':')[1]

      const eventId = interaction.values[0]

      if (commandName === 'invite-event') {
        await prepareUserSelection(interaction, eventId)
      } else if (commandName === 'join-event') {
        await handleEventSelection(interaction, 'join-event', eventId)
      } else if (commandName === 'leave-event') {
        await handleEventSelection(interaction, 'leave-event', eventId)
      } else if (commandName === 'update-event') {
        await handleEventUpdate(interaction, eventId)
      } else if (commandName === 'cancel-event') {
        await handleEventCancel(interaction, eventId)
      }
    } else if (interaction.customId.startsWith('select-users-for-invite:')) {
      const eventId = interaction.customId.split(':')[1]
      await handleUserSelection(interaction, eventId)
    }
  },
}
