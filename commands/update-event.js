const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('update-event')
    .setDescription('Update an event you created earlier')
    .setDescriptionLocalizations({
      id: 'Perbarui acara yang Anda buat sebelumnya',
      da: 'Opdater en begivenhed, du har oprettet tidligere',
      de: 'Aktualisiere ein Ereignis, das Sie früher erstellt haben',
      'en-GB': 'Update an event you created earlier',
      'en-US': 'Update an event you created earlier',
      'es-ES': 'Actualizar un evento que creaste anteriormente',
      'es-419': 'Actualizar un evento que creaste anteriormente',
      fr: 'Mettre à jour un événement que vous avez créé plus tôt',
      hr: 'Ažurirajte događaj koji ste ranije stvorili',
      it: 'Aggiorna un evento che hai creato in precedenza',
      lt: 'Atnaujinti įvykį, kurį sukūrėte anksčiau',
      hu: 'Frissítse a korábban létrehozott eseményt',
      nl: 'Werk een eerder door jou gemaakt evenement bij',
      no: 'Oppdater en hendelse du opprettet tidligere',
      pl: 'Zaktualizuj wydarzenie, które utworzyłeś wcześniej',
      'pt-BR': 'Atualize um evento que você criou anteriormente',
      ro: 'Actualizați un eveniment creat anterior',
      fi: 'Päivitä aiemmin luomasi tapahtuma',
      'sv-SE': 'Uppdatera ett evenemang du skapade tidigare',
      vi: 'Cập nhật sự kiện bạn đã tạo trước đó',
      tr: 'Önceden oluşturduğunuz bir etkinliği güncelleyin',
      cs: 'Aktualizovat událost, kterou jste dříve vytvořili',
      el: 'Ενημέρωση μιας εκδήλωσης που δημιουργήσατε νωρίτερα',
      bg: 'Актуализирайте събитие, което сте създали по-рано',
      ru: 'Обновить событие, которое вы создали ранее',
      uk: 'Оновити подію, яку ви створили раніше',
      hi: 'एक घटना को अपडेट करें जिसे आपने पहले बनाया था',
      th: 'อัปเดตเหตุการณ์ที่คุณสร้างไว้ก่อนหน้านี้',
      'zh-CN': '更新您之前创建的事件',
      ja: '以前に作成したイベントを更新する',
      'zh-TW': '更新您之前創建的事件',
      ko: '이전에 생성한 이벤트를 업데이트합니다',
    }),
  async execute(interaction) {
    console.log('update-event')
    await prepareEventSelection(interaction, 'update-event')
  },
}
