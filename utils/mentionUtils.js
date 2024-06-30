// utils/mentionUtils.js

function getMentionUsersString(usersIds) {
  return usersIds.map((discordID) => `<@${discordID}>`).join(', ')
}

async function getUsersName(usersIds, client) {
  const users = await Promise.all(
    usersIds.map(async (discordID) => {
      const user = await client.users.fetch(discordID)
      return user.username // Assuming you want to get the username property
    })
  )
  return users.join(', ')
}

module.exports = {
  getMentionUsersString,
  getUsersName,
}
