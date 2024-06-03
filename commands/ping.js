const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  async execute(interaction) {
    // Komutu çalıştıran kullanıcı bilgileri
    const user = interaction.user
    console.log('user', user)
    console.log('user', user.flags)

    // Kullanıcı bilgilerini yanıt olarak gönderme
    await interaction.reply(`Pong! Komutu çalıştıran kullanıcı: ${user}`)
  },
}
