const axios = require('axios')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/'

async function fetchEventsByGuild(guild) {
  try {
    const response = await axios.get(`${BASE_URL}event?guild=${guild}`)
    return response.data
  } catch (error) {
    console.error('Error fetching events by guild:', error)
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
  createEvent,
  fetchEvent,
  fetchEventsByGuild,
}
