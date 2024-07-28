const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js')
const { createEvent } = require('../services/event-service')
const { handleEventAction } = require('../utils/handle-event-action')
const { showModalWithInputs, handleModalSubmit } = require('../utils/modal-utils')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-event')
    .setDescription('Create an event')
    .setDescriptionLocalizations({
      id: 'Buat acara',
      da: 'Opret en begivenhed',
      de: 'Ein Ereignis erstellen',
      'en-GB': 'Create an event',
      'en-US': 'Create an event',
      'es-ES': 'Crear un evento',
      'es-419': 'Crear un evento',
      fr: 'Créer un événement',
      hr: 'Kreiraj događaj',
      it: 'Crea un evento',
      lt: 'Sukurti įvykį',
      hu: 'Esemény létrehozása',
      nl: 'Maak een evenement',
      no: 'Opprett en hendelse',
      pl: 'Utwórz wydarzenie',
      'pt-BR': 'Criar um evento',
      ro: 'Creați un eveniment',
      fi: 'Luo tapahtuma',
      'sv-SE': 'Skapa en händelse',
      vi: 'Tạo sự kiện',
      tr: 'Bir etkinlik oluştur',
      cs: 'Vytvořit událost',
      el: 'Δημιουργία εκδήλωσης',
      bg: 'Създайте събитие',
      ru: 'Создать событие',
      uk: 'Створити подію',
      hi: 'एक घटना बनाएँ',
      th: 'สร้างเหตุการณ์',
      'zh-CN': '创建事件',
      ja: 'イベントを作成する',
      'zh-TW': '創建事件',
      ko: '이벤트 만들기',
    }),
  async execute(interaction) {
    console.log('create-event')
    await showModalWithInputs(interaction, 'eventModal', 'Create Event')

    const filter = (i) => i.customId === 'eventModal'
    interaction
      .awaitModalSubmit({ filter, time: 60000 })
      .then(async (modalInteraction) => {
        const eventData = handleModalSubmit(modalInteraction)
        if (eventData.error) {
          return modalInteraction.reply({ content: eventData.error, ephemeral: true })
        }

        try {
          const event = await createEvent({
            ...eventData,
            creator: interaction.user.id,
            guild: interaction.guild.id,
            users: [],
          })

          if (!modalInteraction.replied) {
            await handleEventAction(modalInteraction, 'create-event', event._id)
          } else {
            await modalInteraction.followUp({ content: 'Event updated successfully.', ephemeral: true })
          }
        } catch (error) {
          return modalInteraction.reply({
            content:
              error.response && error.response.data
                ? error.response.data.error
                : 'An error occurred while creating the event.',
            ephemeral: true,
          })
        }
      })
      .catch(console.error)
  },
}
