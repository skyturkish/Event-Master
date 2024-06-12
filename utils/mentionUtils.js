// utils/mentionUtils.js

function getMentionUsersString(usersIds) {
  return usersIds.map((discordID) => `<@${discordID}>`).join(', ')
}

module.exports = {
  getMentionUsersString,
}
