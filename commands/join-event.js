const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join-event')
    .setDescription('Join an event by selecting from the list of available events')
    .setDescriptionLocalizations({
      id: 'Bergabung dengan acara',
      da: 'Deltag i en begivenhed',
      de: 'An einem Ereignis teilnehmen',
      'en-GB': 'Join an event',
      'en-US': 'Join an event',
      'es-ES': 'Unirse a un evento',
      'es-419': 'Unirse a un evento',
      fr: 'Rejoindre un événement',
      hr: 'Pridružite se događaju',
      it: 'Partecipa a un evento',
      lt: 'Prisijungti prie renginio',
      hu: 'Csatlakozz egy eseményhez',
      nl: 'Neem deel aan een evenement',
      no: 'Bli med på en begivenhet',
      pl: 'Dołącz do wydarzenia',
      'pt-BR': 'Participar de um evento',
      ro: 'Participă la un eveniment',
      fi: 'Liity tapahtumaan',
      'sv-SE': 'Gå med i en händelse',
      vi: 'Tham gia sự kiện',
      tr: 'Bir etkinliğe katıl',
      cs: 'Připojit se k události',
      el: 'Συμμετοχή σε εκδήλωση',
      bg: 'Присъединете се към събитие',
      ru: 'Присоединиться к событию',
      uk: 'Приєднатися до події',
      hi: 'किसी घटना में शामिल हों',
      th: 'เข้าร่วมเหตุการณ์',
      'zh-CN': '加入活动',
      ja: 'イベントに参加する',
      'zh-TW': '加入活動',
      ko: '이벤트에 참여하세요',
    }),
  async execute(interaction) {
    console.log('join-event')
    await prepareEventSelection(interaction, 'join-event')
  },
}
