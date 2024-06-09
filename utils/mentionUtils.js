// utils/mentionUtils.js

function getMentionUsersString(participantsIds) {
  return participantsIds.map((discordID) => `<@${discordID}>`).join(', ')
}

module.exports = {
  getMentionUsersString,
}
