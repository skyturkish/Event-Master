const handleUserSelection = require('../handlers/user-selection-for-invite')
const handleEventSelection = require('../handlers/event-selection-for-invite')
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
      await handleEventSelection(interaction)
    }

    if (interaction.customId.startsWith('select-users-for-invite:')) {
      await handleUserSelection(interaction)
    }
  },
}
