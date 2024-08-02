const fs = require('fs')
const path = require('path')

function getLocalizedValue(locale, keyPath, params = {}) {
  const filePath = path.join(__dirname, '..', 'locales', `${locale}.json`)
  let data

  if (fs.existsSync(filePath)) {
    data = fs.readFileSync(filePath, 'utf8')
  } else {
    const defaultFilePath = path.join(__dirname, '..', 'locales', 'en-US.json')
    data = fs.readFileSync(defaultFilePath, 'utf8')
  }

  const jsonData = JSON.parse(data)
  let value = getValueByPath(jsonData, keyPath)

  if (keyPath.startsWith('dynamic') && value && params) {
    value = replacePlaceholders(value, params)
  }

  return value
}

function getValueByPath(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

function replacePlaceholders(str, params) {
  return str.replace(/\$\{([^}]+)\}/g, (match, p1) => params[p1.trim()] || match)
}

module.exports = { getLocalizedValue }
