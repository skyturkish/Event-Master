const dotenv = require('dotenv')
const { Client, Events, GatewayIntentBits } = require('discord.js')

dotenv.config()

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.login(process.env.DISCORD_TOKEN)
