const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('cancel-event')
    .setDescription('Cancel an event')
    .setDescriptionLocalizations({
      id: 'Membatalkan sebuah acara',
      da: 'Annuller en begivenhed',
      de: 'Ein Ereignis absagen',
      'en-GB': 'Cancel an event',
      'en-US': 'Cancel an event',
      'es-ES': 'Cancelar un evento',
      'es-419': 'Cancelar un evento',
      fr: 'Annuler un événement',
      hr: 'Otkazivanje događaja',
      it: 'Annulla un evento',
      lt: 'Atšaukti renginį',
      hu: 'Esemény törlése',
      nl: 'Een evenement annuleren',
      no: 'Avbryt en hendelse',
      pl: 'Anuluj wydarzenie',
      'pt-BR': 'Cancelar um evento',
      ro: 'Anulează un eveniment',
      fi: 'Peruuta tapahtuma',
      'sv-SE': 'Avbryt ett evenemang',
      vi: 'Hủy một sự kiện',
      tr: 'Bir etkinliği iptal et',
      cs: 'Zrušit událost',
      el: 'Ακύρωση εκδήλωσης',
      bg: 'Отмяна на събитие',
      ru: 'Отменить событие',
      uk: 'Скасувати подію',
      hi: 'घटना रद्द करें',
      th: 'ยกเลิกเหตุการณ์',
      'zh-CN': '取消活动',
      ja: 'イベントをキャンセルする',
      'zh-TW': '取消活動',
      ko: '이벤트 취소',
    }),
  async execute(interaction) {
    console.log('cancel-event')
    await prepareEventSelection(interaction, 'cancel-event')
  },
}
