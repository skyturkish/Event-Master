const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave-event')
    .setDescription('Leave an event you are currently participating in')
    .setDescriptionLocalizations({
      id: 'Tinggalkan acara',
      da: 'Forlad en begivenhed',
      de: 'Verlassen Sie eine Veranstaltung',
      'en-GB': 'Leave an event',
      'en-US': 'Leave an event',
      'es-ES': 'Dejar un evento',
      'es-419': 'Dejar un evento',
      fr: 'Quitter un événement',
      hr: 'Napusti događaj',
      it: 'Lascia un evento',
      lt: 'Palikti įvykį',
      hu: 'Hagyjon el egy eseményt',
      nl: 'Verlaat een evenement',
      no: 'Forlat en hendelse',
      pl: 'Opuść wydarzenie',
      'pt-BR': 'Deixar um evento',
      ro: 'Părăsiți un eveniment',
      fi: 'Jätä tapahtuma',
      'sv-SE': 'Lämna en händelse',
      vi: 'Rời khỏi một sự kiện',
      tr: 'Bir etkinlikten ayrıl',
      cs: 'Opustit událost',
      el: 'Αφήστε μια εκδήλωση',
      bg: 'Напуснете събитие',
      ru: 'Покинуть мероприятие',
      uk: 'Покинути подію',
      hi: 'एक घटना छोड़ दें',
      th: 'ออกจากเหตุการณ์',
      'zh-CN': '离开事件',
      ja: 'イベントを離れる',
      'zh-TW': '離開事件',
      ko: '이벤트 나가기',
    }),
  async execute(interaction) {
    console.log('leave-event')
    await prepareEventSelection(interaction, 'leave-event')
  },
}
