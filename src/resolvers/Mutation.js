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

// function createStandupDetail(parent, args, context, info) {
//   return context.db.mutation.createStandupDetail(
//     {
//       data: {
//         forUser: {
//           connect: {
//             id: args.userId,
//           },
//         },
//         // ...args.standUpDetails,
//         timeTaken: args.timeTake,
//         notes: args.notes,
//       },
//     },
//     info
//   )
// }

// async function createLeave(parent, args, context, info) {
//   var mailOptions = {
//     from: "heath.dunlop.hd@gmail.com",
//     to: "heath.dunlop@nomosone.com",
//     subject: `${args.userId} is requesting leave`,
//     text: `Total Leave days: ${args.daysOfLeave +
//       args.publicHolidays} last day of work: ${args.lastDayOfWork}`,
//   }
//   await transporter.sendMail(mailOptions, function(error, info) {
//     if (error) {
//       console.log(error)
//     } else {
//       console.log("Email sent: " + info.response)
//     }
//   })
//   return context.db.mutation.createLeave(
//     {
//       data: {
//         type: args.type,
//         forUser: {
//           connect: {
//             id: args.userId,
//           },
//         },
//         lastDayOfWork: args.lastDayOfWork,
//         firstDayOfLeave: args.firstDayOfLeave,
//         lastDayOfLeave: args.lastDayOfLeave,
//         firstDayOfWork: args.firstDayOfWork,
//         daysOfLeave: args.daysOfLeave,
//         publicHolidays: args.publicHolidays,
//         totalLeaveDays: args.daysOfLeave + args.publicHolidays,
//       },
//     },
//     info
//   )
// }

module.exports = {
  signup,
  login,
  changeUserRole,
  createStandupDetail,
  createLeave,
}
