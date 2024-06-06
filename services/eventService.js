const axios = require('axios')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/'

async function createEvent(eventData) {
  try {
    const response = await axios.post(`${BASE_URL}event`, eventData)
    return response.data
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

module.exports = {
  createEvent,
}
