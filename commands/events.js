const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder().setName('events').setDescription('See all events').setDescriptionLocalizations({
    id: 'Lihat semua acara',
    da: 'Se alle begivenheder',
    de: 'Alle Ereignisse anzeigen',
    'en-GB': 'See all events',
    'en-US': 'See all events',
    'es-ES': 'Ver todos los eventos',
    'es-419': 'Ver todos los eventos',
    fr: 'Voir tous les événements',
    hr: 'Pogledajte sve događaje',
    it: 'Vedi tutti gli eventi',
    lt: 'Žiūrėti visus įvykius',
    hu: 'Összes esemény megtekintése',
    nl: 'Bekijk alle evenementen',
    no: 'Se alle hendelser',
    pl: 'Zobacz wszystkie wydarzenia',
    'pt-BR': 'Ver todos os eventos',
    ro: 'Vezi toate evenimentele',
    fi: 'Näytä kaikki tapahtumat',
    'sv-SE': 'Se alla händelser',
    vi: 'Xem tất cả các sự kiện',
    tr: 'Tüm etkinlikleri gör',
    cs: 'Zobrazit všechny události',
    el: 'Δείτε όλες τις εκδηλώσεις',
    bg: 'Виж всички събития',
    ru: 'Посмотреть все события',
    uk: 'Переглянути всі події',
    hi: 'सभी घटनाएं देखें',
    th: 'ดูเหตุการณ์ทั้งหมด',
    'zh-CN': '查看所有事件',
    ja: 'すべてのイベントを表示',
    'zh-TW': '查看所有事件',
    ko: '모든 이벤트 보기',
  }),
  async execute(interaction) {
    console.log('events')
    await prepareEventSelection(interaction, 'events')
  },
}
