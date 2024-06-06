const axios = require('axios')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/'

async function fetchEvents() {
  try {
    const response = await axios.get(`${BASE_URL}event`)

    return response.data
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

async function fetchEvent(eventId) {
  try {
    const response = await axios.get(`${BASE_URL}event/${eventId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

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
  fetchEvents,
  createEvent,
  fetchEvent,
}
