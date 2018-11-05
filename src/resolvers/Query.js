const { APP_SECRET, getUserId } = require("../utils")

function getAllLeave(root, args, context, info) {
  return context.db.query.leaves({}, info)
}

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
  getAllLeave,
  getStandupDetails,
  getUser,
  allUsers,
  info,
}
