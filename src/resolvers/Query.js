const { APP_SECRET, getUserId } = require("../utils")

function getStandupDetails(root, args, context, info) {
  return context.db.query.standupDetails({}, info)
}

function allUsers(root, args, context, info) {
  return context.db.query.users({}, info)
}

//getStandupDetails

function getUser(root, args, context, info) {
  const userId = getUserId(context)
  return context.db.query.user({ where: { id: userId } }, info)
}

function info(root, args, context, info) {
  return "😎 => 🔯 => 🔥 => 💯 => ()"
}

module.exports = {
  getStandupDetails,
  getUser,
  allUsers,
  info,
}
