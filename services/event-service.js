const axios = require('axios')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/'

async function fetchEventsByCriteria({ guild, status, participantDiscordID, participantStatus, creator }) {
  try {
    const queryParams = new URLSearchParams()
    if (guild) queryParams.append('guild', guild)
    if (status) queryParams.append('status', status)
    if (participantDiscordID) queryParams.append('participantDiscordID', participantDiscordID)
    if (participantStatus) queryParams.append('participantStatus', participantStatus)
    if (creator) queryParams.append('creator', creator)

    const response = await axios.get(`${BASE_URL}event?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching events by criteria:', error)
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

async function addOrUpdateParticipant(eventId, participantId, status = 'invited') {
  try {
    const event = await fetchEvent(eventId)

    if (!event) throw new Error('Event not found')

    await axios.put(`${BASE_URL}event/${eventId}/participants/${participantId}`, { status })
  } catch (error) {
    console.error('Error adding or updating participant:', error)
    throw error
  }
}

async function updateEvent(eventId, eventData) {
  try {
    await axios.put(`${BASE_URL}event/${eventId}`, eventData)
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

module.exports = {
  createEvent,
  fetchEvent,
  fetchEventsByCriteria,
  addOrUpdateParticipant,
  updateEvent,
}
