const { APP_SECRET, getUserId } = require("../utils")

async function questionFeed(parent, args, context, info) {
  const where = args.filter
    ? {
        AND: [
          {
            name_contains: args.filter[0],
          },
        ],
      }
    : {}

  // 1.
  const queriedQuestions = await context.db.query.questions(
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
  const questionsConnection = await context.db.query.leavesConnection(
    {},
    countSelectionSet
  )

  // 3
  return {
    count: questionsConnection.aggregate.count,
    questionIds: queriedQuestions.map(question => question.id),
  }
}

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

async function questionsFullTextSearch(parent, args, context, info) {
  // user supplied search string
  const searchString = args.search.toLowerCase()
  // func to filter our list by full text search on the name field
  function find(items, text) {
    text = text.split(" ")
    return items.filter(function(item) {
      return text.every(function(el) {
        return item.name.toLowerCase().indexOf(el) > -1
      })
    })
  }
  // not ideal but get all of the questions returned to the server
  const allItems = await context.db.query.questions({}, info)
  // filter by our search function
  const searchedItems = find(allItems, searchString)
  // send filtered list to the client
  return searchedItems
}

function getAllLeave(root, args, context, info) {
  return context.db.query.leaves({}, info)
}

function getStandupDetails(root, args, context, info) {
  return context.db.query.standupDetails({}, info)
}

function allTags(root, args, context, info) {
  return context.db.query.tags({}, info)
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
  questionFeed,
  getStandupDetails,
  getUser,
  allUsers,
  allTags,
  info,
  searchQuestions,
  questionsFullTextSearch,
}
