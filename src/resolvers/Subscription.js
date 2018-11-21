function newLeaveSubscribe(parent, args, context, info) {
  return context.db.subscription.leave(
    { where: { mutation_in: ["CREATED"] } },
    info
  )
}

const newLeave = {
  subscribe: newLeaveSubscribe,
}

function newTagSubscribe(parent, args, context, info) {
  return context.db.subscription.tag(
    { where: { mutation_in: ["CREATED"] } },
    info
  )
}

const newTag = {
  subscribe: newTagSubscribe,
}

module.exports = {
  newLeave,
  newTag,
}
