const { SlashCommandBuilder } = require('discord.js')
const { prepareEventSelection } = require('../utils/prepare-event-selection')

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('start-event')
    .setDescription('Start an event you created and is ready to begin')
    .setDescriptionLocalizations({
      id: 'Mulai acara yang Anda buat dan siap dimulai',
      da: 'Start en begivenhed, du har oprettet, og er klar til at begynde',
      de: 'Starten Sie eine Veranstaltung, die Sie erstellt haben und bereit ist zu beginnen',
      'en-GB': 'Start an event you created and is ready to begin',
      'en-US': 'Start an event you created and is ready to begin',
      'es-ES': 'Inicia un evento que creaste y está listo para comenzar',
      'es-419': 'Inicia un evento que creaste y está listo para comenzar',
      fr: 'Commencez un événement que vous avez créé et qui est prêt à commencer',
      hr: 'Započnite događaj koji ste stvorili i spremni ste za početak',
      it: 'Inizia un evento che hai creato ed è pronto per iniziare',
      lt: 'Pradėkite įvykį, kurį sukūrėte ir kuris yra pasiruošęs prasidėti',
      hu: 'Indítson egy eseményt, amelyet létrehozott, és amely készen áll a kezdésre',
      nl: 'Start een evenement dat je hebt gemaakt en dat klaar is om te beginnen',
      no: 'Start en begivenhet du opprettet og er klar til å begynne',
      pl: 'Rozpocznij wydarzenie, które utworzyłeś i jest gotowe do rozpoczęcia',
      'pt-BR': 'Inicie um evento que você criou e está pronto para começar',
      ro: 'Începeți un eveniment pe care l-ați creat și este gata să înceapă',
      fi: 'Aloita tapahtuma, jonka loit ja on valmis alkamaan',
      'sv-SE': 'Starta ett evenemang du skapade och är redo att börja',
      vi: 'Bắt đầu một sự kiện bạn đã tạo và sẵn sàng bắt đầu',
      tr: 'Oluşturduğunuz ve başlamaya hazır bir etkinliği başlatın',
      cs: 'Spusťte událost, kterou jste vytvořili, a je připravena začít',
      el: 'Ξεκινήστε μια εκδήλωση που δημιουργήσατε και είναι έτοιμη να ξεκινήσει',
      bg: 'Започнете събитие, което сте създали и е готово да започне',
      ru: 'Начните мероприятие, которое вы создали и готово к началу',
      uk: 'Почніть подію, яку ви створили і яка готова початися',
      hi: 'एक घटना शुरू करें जिसे आपने बनाया है और शुरू करने के लिए तैयार है',
      th: 'เริ่มกิจกรรมที่คุณสร้างขึ้นและพร้อมที่จะเริ่มต้น',
      'zh-CN': '开始你创建并准备开始的事件',
      ja: 'あなたが作成したイベントを開始し、開始する準備ができました',
      'zh-TW': '開始您創建並準備開始的事件',
      ko: '생성한 이벤트를 시작하고 시작할 준비가 되었습니다',
    }),
  async execute(interaction) {
    console.log('start-event')
    await prepareEventSelection(interaction, 'start-event')
  },
}
