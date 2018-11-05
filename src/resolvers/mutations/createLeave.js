var nodemailer = require("nodemailer")
var Table = require("table-builder")
var moment = require("moment")

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "heath.dunlop.hd@gmail.com",
    pass: "Gamerextreme24",
  },
})

function emailTable(args) {
  // const table = `
  // <table>
  //   <tr>
  //     <td>Days of leave</td>
  //     <td>${args.daysOfLeave}</td>
  //   </tr>
  // </table>`
  // return table
  var data = [
    {
      type: "Last day of work: ",
      date: moment(args.lastDayOfWork).format("D MMM YYYY"),
    },
    {
      type: "First day of leave: ",
      date: moment(args.firstDayOfLeave).format("D MMM YYYY"),
    },
    {
      type: "Last day of leave: ",
      date: moment(args.lastDayOfLeave).format("D MMM YYYY"),
    },
    {
      type: "First day of work: ",
      date: moment(args.firstDayOfWork).format("D MMM YYYY"),
    },
    {
      type: "Days of leave: ",
      date: args.daysOfLeave,
    },
    {
      type: "Public holidays: ",
      date: args.publicHolidays,
    },
    {
      type: "Total leave days: ",
      date: args.daysOfLeave + args.publicHolidays,
    },
  ]
  var headers = { type: "Type", date: "Date" }
  var htmlTable = new Table({ class: "some-table" })
    .setHeaders(headers) // see above json headers section
    .setData(data) // see above json data section
    .render()
  return htmlTable
}

async function createLeave(parent, args, context, info) {
  // const user = await context.db.query.user(
  //   { where: { email: args.email } },
  //   ` { id password } `
  // )
  // const user = await context.db.query.user({ where: { id: args.id } })
  const user = await context.db.query.user(
    { where: { id: args.userId } },
    ` { name email phone } `
  )
  console.log("Did we get the user? ", user)
  var mailOptions = {
    from: "heath.dunlop.hd@gmail.com",
    to: "heath.dunlop.hd@gmail.com",
    subject: `${user.name} is requesting leave`,
    // text: emailBody(args),
    html: `<p style="color:#3f51b5;"><span style="color: #f50057;">${
      user.name
    }</span> is requesting <span style="color: #f50057;">${
      args.type
    }</span></p><p style="color: #3f51b5;">email: <span style="color: #f50057;">${
      user.email
    }</span></p>
    <p style="color: #3f51b5;">phone: <span style="color: #f50057;">${
      user.phone
    }</span></p>
    ${emailTable(args)}`,
  }
  await transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log("Email sent: " + info.response)
    }
  })
  return context.db.mutation.createLeave(
    {
      data: {
        type: args.type,
        forUser: {
          connect: {
            id: args.userId,
          },
        },
        lastDayOfWork: args.lastDayOfWork,
        firstDayOfLeave: args.firstDayOfLeave,
        lastDayOfLeave: args.lastDayOfLeave,
        firstDayOfWork: args.firstDayOfWork,
        daysOfLeave: args.daysOfLeave,
        publicHolidays: args.publicHolidays,
        totalLeaveDays: args.daysOfLeave + args.publicHolidays,
      },
    },
    info
  )
}

module.exports = {
  createLeave,
}
