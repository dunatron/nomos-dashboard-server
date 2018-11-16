const { APP_SECRET, getUserId } = require("../utils")

async function leaveFeed(parent, args, context, info) {
  const where = args.betweenFilter
    ? {
        AND: [
          {
            firstDayOfLeave_gte: args.betweenFilter[0],
            lastDayOfLeave_lte: args.betweenFilter[1],
          },
        ],
      }
    : {}

  // 1.
  const queriedLeaves = await context.db.query.leaves(
    { where, skip: args.skip, first: args.first, orderBy: args.orderBy },
    `{ id }`
  )

  // 2.
  const countSelectionSet = `
    {
      aggregate {
        count
      }
    }
  `
  const leavesConnection = await context.db.query.leavesConnection(
    {},
    countSelectionSet
  )

  // 3
  return {
    count: leavesConnection.aggregate.count,
    leaveIds: queriedLeaves.map(leave => leave.id),
  }
}

async function searchQuestions(parent, args, context, info) {
  const searchString = args.search
  return context.db.query.questions(
    { where: { name_contains: searchString } },
    info
  )
}

function getAllLeave(root, args, context, info) {
  return context.db.query.leaves({}, info)
}

function getStandupDetails(root, args, context, info) {
  return context.db.query.standupDetails({}, info)
}

function allUsers(root, args, context, info) {
  return context.db.query.users({}, info)
}

function getUser(root, args, context, info) {
  const userId = getUserId(context)
  return context.db.query.user({ where: { id: userId } }, info)
}

function info(root, args, context, info) {
  return "😎 => 🔯 => 🔥 => 💯 => ()"
}

module.exports = {
  getAllLeave,
  leaveFeed,
  getStandupDetails,
  getUser,
  allUsers,
  info,
  searchQuestions,
}
