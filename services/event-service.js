const axios = require('axios')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function fetchEventsByCriteria({ guild, status, userDiscordID, userStatus, creator }) {
  const queryParams = new URLSearchParams()
  if (guild) queryParams.append('guild', guild)
  if (status) queryParams.append('status', status)
  if (userDiscordID) queryParams.append('userDiscordID', userDiscordID)
  if (userStatus) queryParams.append('userStatus', userStatus)
  if (creator) queryParams.append('creator', creator)

  const response = await axios.get(`${BASE_URL}/event?${queryParams.toString()}`)
  return response.data
}

async function fetchEvent(eventId) {
  try {
    const response = await axios.get(`${BASE_URL}/event/${eventId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

async function createEvent(eventData) {
  try {
    const response = await axios.post(`${BASE_URL}/event`, eventData)
    return response.data
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

async function addOrUpdateUser(eventId, userId, status = 'invited') {
  try {
    await axios.put(`${BASE_URL}/event/${eventId}/users/${userId}`, { status })
  } catch (error) {
    console.error('Error adding or updating user:', error)
    throw error
  }
}

async function updateEvent(eventId, eventData) {
  await axios.put(`${BASE_URL}/event/${eventId}`, eventData)
}

module.exports = {
  createEvent,
  fetchEvent,
  fetchEventsByCriteria,
  addOrUpdateUser,
  updateEvent,
}
