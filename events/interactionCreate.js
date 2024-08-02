const { prepareUserSelection } = require('../utils/prepare-user-selection')
const { handleEventAction } = require('../utils/handle-event-action')
const { handleUserSelection } = require('../utils/handle-user-selection')
const { handleEventCancel } = require('../utils/handle-event-cancel')
const { Events } = require('discord.js')
const { cooldowns } = require('../utils/cooldowns')
const { getLocalizedValue } = require('../utils/localization')

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      // if (!interaction.isChatInputCommand()) return

      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName)
        if (!command) {
          console.error(`No command matching ${interaction.commandName} was found.`)
          return
        }

        const { cooldown = 0 } = command
        const now = Date.now()
        const timestamps = cooldowns.get(command.data.name) || new Map()
        const cooldownAmount = cooldown * 1000

        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount

          if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000
            const pleaseWait = getLocalizedValue(interaction.locale, 'dynamic.pleaseWait', {
              timeLeft: timeLeft.toFixed(1),
              'command.data.name': command.data.name,
            })

            return interaction.reply({
              content: pleaseWait,
              ephemeral: true,
            })
          }
        }

        timestamps.set(interaction.user.id, now)
        cooldowns.set(command.data.name, timestamps)
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)

        await command.execute(interaction)
      }

      if (!interaction.isStringSelectMenu() && !interaction.isButton() && !interaction.isUserSelectMenu()) return

      if (interaction.isButton()) {
        console.log('Button interaction:', interaction.customId)
      }

      if (interaction.customId.startsWith('select-event-for-:')) {
        const commandName = interaction.customId.split(':')[1]

        const eventId = interaction.values[0]

        if (commandName === 'invite-event') {
          await prepareUserSelection(interaction, eventId)
        } else if (commandName === 'join-event') {
          await handleEventAction(interaction, 'join-event', eventId)
        } else if (commandName === 'leave-event') {
          await handleEventAction(interaction, 'leave-event', eventId)
        } else if (commandName === 'update-event') {
          await handleEventAction(interaction, 'update-event', eventId)
        } else if (commandName === 'cancel-event') {
          await handleEventCancel(interaction, eventId)
        } else if (commandName === 'start-event') {
          await handleEventAction(interaction, 'start-event', eventId)
        } else if (commandName === 'finish-event') {
          await handleEventAction(interaction, 'finish-event', eventId)
        } else if (commandName === 'events') {
          await handleEventAction(interaction, 'events', eventId)
        } else if (commandName === 'active-events') {
          await handleEventAction(interaction, 'active-events', eventId)
        }
      } else if (interaction.customId.startsWith('select-users-for-invite-event:')) {
        const eventId = interaction.customId.split(':')[1]
        await handleUserSelection(interaction, eventId)
      }
    } catch (error) {
      console.log('interactionCreate Error:', error)
    }
  },
}
