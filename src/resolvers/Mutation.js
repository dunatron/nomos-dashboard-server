const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { APP_SECRET, getUserId } = require("../utils")
const { createStandupDetail } = require("./mutations/createStandupDetail")
const { createLeave } = require("./mutations/createLeave")

async function signup(parent, args, context, info) {
  if (args.email.length < 3) {
    throw new Error("Email should have more than 3 characters")
  }
  // 1
  const password = await bcrypt.hash(args.password, 10)
  // 2
  const user = await context.db.mutation.createUser(
    {
      data: { ...args, password },
    },
    `{ id }`
  )

  // 3
  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  // 4
  return {
    token,
    user,
  }
}

async function login(parent, args, context, info) {
  // 1
  const user = await context.db.query.user(
    { where: { email: args.email } },
    ` { id password } `
  )
  if (!user) {
    throw new Error("No such user found")
  }

  // 2
  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error("Invalid password")
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  // 3
  return {
    token,
    user,
  }
}

function changeUserRole(parent, args, context, info) {
  return context.db.mutation.updateUser(
    {
      data: {
        role: args.role,
      },
      where: { id: args.id },
    },
    info
  )
}

function acceptLeave(parent, args, context, info) {
  return context.db.mutation.updateLeave(
    {
      data: {
        status: "ACCEPTED",
      },
      where: { id: args.id },
    },
    info
  )
}

async function createQuestion(parent, args, context, info) {
  console.group(createQuestion)
  console.log("parent => ", parent)
  console.log("args => ", args)
  console.log("context => ", context)
  console.groupEnd()
  const question = await context.db.mutation.createQuestion(
    {
      data: { ...args.data },
    },
    info
  )

  console.log("Question being retiurnder => ", question)

  return question

  // return context.db.mutation.createQuestion(
  //   {
  //     data: {
  //       name: args.data.name,
  //       answers:
  //     },
  //   },
  //   info
  // )
}
// createQuestion

module.exports = {
  acceptLeave,
  signup,
  login,
  changeUserRole,
  createStandupDetail,
  createLeave,
  createQuestion,
}
