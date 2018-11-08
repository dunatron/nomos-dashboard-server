function newLeaveSubscribe(parent, args, context, info) {
  return context.db.subscription.leave(
    { where: { mutation_in: ["CREATED"] } },
    info
  )
}

const newLeave = {
  subscribe: newLeaveSubscribe,
}

module.exports = {
  newLeave,
}
