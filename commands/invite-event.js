const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('invite-event')
    .setDescription('Invite people to an event!')
    .setDescriptionLocalizations({
      id: 'Undang orang ke acara!',
      da: 'Inviter folk til en begivenhed!',
      de: 'Lade Leute zu einer Veranstaltung ein!',
      'en-GB': 'Invite people to an event!',
      'en-US': 'Invite people to an event!',
      'es-ES': 'Invitar a personas a un evento!',
      'es-419': 'Invitar a personas a un evento!',
      fr: 'Inviter des gens à un événement!',
      hr: 'Pozovite ljude na događaj!',
      it: 'Invita persone a un evento!',
      lt: 'Kviečiame žmones į renginį!',
      hu: 'Hívj meg embereket egy eseményre!',
      nl: 'Mensen uitnodigen voor een evenement!',
      no: 'Inviter folk til en hendelse!',
      pl: 'Zaproś ludzi na wydarzenie!',
      'pt-BR': 'Convide pessoas para um evento!',
      ro: 'Invită oameni la un eveniment!',
      fi: 'Kutsu ihmisiä tapahtumaan!',
      'sv-SE': 'Bjud in folk till ett evenemang!',
      vi: 'Mời mọi người đến một sự kiện!',
      tr: 'İnsanları bir etkinliğe davet edin!',
      cs: 'Pozvěte lidi na událost!',
      el: 'Προσκαλέστε ανθρώπους σε μια εκδήλωση!',
      bg: 'Поканете хора на събитие!',
      ru: 'Пригласить людей на событие!',
      uk: 'Запросити людей на захід!',
      hi: 'एक घटना में लोगों को आमंत्रित करें!',
      th: 'เชิญคนเข้าร่วมงาน!',
      'zh-CN': '邀请人们参加活动！',
      ja: 'イベントに人々を招待する！',
      'zh-TW': '邀請人們參加活動！',
      ko: '이벤트에 사람들을 초대하세요!',
    }),
  async execute(interaction) {
    console.log('invite-event')
    await prepareEventSelection(interaction, 'invite-event')
  },
}
