const handleUserSelectionForInvite = require('../handlers/user-selection-for-invite')
const handleEventSelectionForInvite = require('../handlers/event-selection-for-invite')
const { handleEventSelection } = require('../utils/event')
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

    if (interaction.customId === 'select-event-for-invite') {
      await handleEventSelectionForInvite(interaction)
    } else if (interaction.customId.startsWith('select-users-for-invite:')) {
      await handleUserSelectionForInvite(interaction)
    } else if (interaction.customId === 'select-event-for-join-event') {
      await handleEventSelection(interaction, 'join-event')
    } else if (interaction.customId === 'select-event-for-leave-event') {
      await handleEventSelection(interaction, 'leave-event')
    }
  },
}
