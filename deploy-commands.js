const dotenv = require('dotenv')

dotenv.config()

const { REST, Routes } = require('discord.js')
const fs = require('node:fs')

const commands = []
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

;(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    // Global command deployment
    const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    })

    console.log(`Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    console.error(error)
  }
})()
