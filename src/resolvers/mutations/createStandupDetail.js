function createStandupDetail(parent, args, context, info) {
  return context.db.mutation.createStandupDetail(
    {
      data: {
        forUser: {
          connect: {
            id: args.userId,
          },
        },
        // ...args.standUpDetails,
        timeTaken: args.timeTake,
        notes: args.notes,
      },
    },
    info
  )
}

module.exports = {
  createStandupDetail,
}
