const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('healthcheck')
    .setDescription('Sistemin sağlığını kontrol edin ve mevcut tarihi döndürün')
    .setDescriptionLocalizations({
      tr: 'Sistemin sağlığını kontrol edin ve mevcut tarihi döndürün',
      id: 'Periksa kesehatan sistem dan kembalikan tanggal saat ini',
      da: 'Tjek systemets sundhed og returner den aktuelle dato',
      de: 'Überprüfen Sie den Systemstatus und geben Sie das aktuelle Datum zurück',
      'en-GB': 'Check system health and return the current date',
      'en-US': 'Check system health and return the current date',
      'es-ES': 'Verifique la salud del sistema y devuelva la fecha actual',
      'es-419': 'Verifique la salud del sistema y devuelva la fecha actual',
      fr: "Vérifiez l'état du système et renvoyez la date actuelle",
      hr: 'Provjerite zdravlje sustava i vratite trenutni datum',
      it: 'Controlla lo stato del sistema e restituisci la data attuale',
      lt: 'Patikrinkite sistemos būklę ir grąžinkite dabartinę datą',
      hu: 'Ellenőrizze a rendszer egészségét és adja vissza az aktuális dátumot',
      nl: 'Controleer de systeemstatus en retourneer de huidige datum',
      no: 'Sjekk systemets helse og returner dagens dato',
      pl: 'Sprawdź stan systemu i zwróć bieżącą datę',
      'pt-BR': 'Verifique a saúde do sistema e retorne a data atual',
      ro: 'Verificați starea sistemului și returnați data curentă',
      fi: 'Tarkista järjestelmän tila ja palauta nykyinen päivämäärä',
      'sv-SE': 'Kontrollera systemets hälsa och returnera aktuellt datum',
      vi: 'Kiểm tra tình trạng hệ thống và trả về ngày hiện tại',
      cs: 'Zkontrolujte zdraví systému a vraťte aktuální datum',
      el: 'Ελέγξτε την υγεία του συστήματος και επιστρέψτε την τρέχουσα ημερομηνία',
      bg: 'Проверете здравето на системата и върнете текущата дата',
      ru: 'Проверьте состояние системы и верните текущую дату',
      uk: 'Перевірте стан системи та поверніть поточну дату',
      hi: 'सिस्टम स्वास्थ्य की जाँच करें और वर्तमान तिथि लौटाएँ',
      th: 'ตรวจสอบสุขภาพของระบบและส่งคืนวันที่ปัจจุบัน',
      'zh-CN': '检查系统健康并返回当前日期',
      ja: 'システムの状態を確認し、現在の日付を返します',
      'zh-TW': '檢查系統健康狀況並返回當前日期',
      ko: '시스템 상태를 확인하고 현재 날짜를 반환합니다',
    }),
  async execute(interaction) {
    const currentDate = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Istanbul' })
    await interaction.reply(`System is healthy! Current date: ${currentDate}`)
  },
}
