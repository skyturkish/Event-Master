const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('finish-event')
    .setDescription('Finish an event')
    .setDescriptionLocalizations({
      id: 'Selesaikan acara',
      da: 'Afslut begivenhed',
      de: 'Ereignis beenden',
      'en-GB': 'Finish an event',
      'en-US': 'Finish an event',
      'es-ES': 'Finalizar un evento',
      'es-419': 'Finalizar un evento',
      fr: 'Terminer un événement',
      hr: 'Završi događaj',
      it: 'Termina un evento',
      lt: 'Užbaigti įvykį',
      hu: 'Fejezd be az eseményt',
      nl: 'Beëindig een evenement',
      no: 'Avslutt hendelse',
      pl: 'Zakończ wydarzenie',
      'pt-BR': 'Finalizar um evento',
      ro: 'Finalizează un eveniment',
      fi: 'Lopeta tapahtuma',
      'sv-SE': 'Avsluta en händelse',
      vi: 'Kết thúc sự kiện',
      tr: 'Etkinliği bitir',
      cs: 'Dokončit událost',
      el: 'Ολοκληρώστε την εκδήλωση',
      bg: 'Завършете събитието',
      ru: 'Завершить событие',
      uk: 'Завершити подію',
      hi: 'घटना समाप्त करें',
      th: 'จบเหตุการณ์',
      'zh-CN': '结束事件',
      ja: 'イベントを終了',
      'zh-TW': '結束事件',
      ko: '이벤트 종료',
    }),
  async execute(interaction) {
    console.log('finish-event')
    await prepareEventSelection(interaction, 'finish-event')
  },
}
