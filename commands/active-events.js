const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('active-events')
    .setDescription('See all active events')
    .setDescriptionLocalizations({
      id: 'Lihat semua acara aktif', // Indonesian
      da: 'Se alle aktive begivenheder', // Danish
      de: 'Alle aktiven Veranstaltungen anzeigen', // German
      'en-GB': 'See all active events', // English, UK
      'en-US': 'See all active events', // English, US
      'es-ES': 'Ver todos los eventos activos', // Spanish, Spain
      'es-419': 'Ver todos los eventos activos', // Spanish, LATAM
      fr: 'Voir tous les événements actifs', // French
      hr: 'Vidi sve aktivne događaje', // Croatian
      it: 'Vedi tutti gli eventi attivi', // Italian
      lt: 'Peržiūrėti visus aktyvius renginius', // Lithuanian
      hu: 'Az összes aktív esemény megtekintése', // Hungarian
      nl: 'Bekijk alle actieve evenementen', // Dutch
      no: 'Se alle aktive arrangementer', // Norwegian
      pl: 'Zobacz wszystkie aktywne wydarzenia', // Polish
      'pt-BR': 'Veja todos os eventos ativos', // Portuguese, Brazilian
      ro: 'Vezi toate evenimentele active', // Romanian, Romania
      fi: 'Katso kaikki aktiiviset tapahtumat', // Finnish
      'sv-SE': 'Se alla aktiva evenemang', // Swedish
      vi: 'Xem tất cả các sự kiện đang hoạt động', // Vietnamese
      tr: 'Tüm aktif etkinlikleri görüntüle', // Turkish
      cs: 'Zobrazit všechny aktivní události', // Czech
      el: 'Δείτε όλες τις ενεργές εκδηλώσεις', // Greek
      bg: 'Виж всички активни събития', // Bulgarian
      ru: 'Посмотреть все активные события', // Russian
      uk: 'Переглянути всі активні події', // Ukrainian
      hi: 'सभी सक्रिय घटनाओं को देखें', // Hindi
      th: 'ดูเหตุการณ์ที่ใช้งานทั้งหมด', // Thai
      'zh-CN': '查看所有活动事件', // Chinese, China (Simplified)
      ja: 'すべてのアクティブなイベントを見る', // Japanese
      'zh-TW': '查看所有活動事件', // Chinese, Taiwan (Traditional)
      ko: '모든 활성 이벤트 보기', // Korean
    }),
  async execute(interaction) {
    console.log('active-events')
    await prepareEventSelection(interaction, 'active-events')
  },
}
