function leaves(parent, args, context, info) {
  return context.db.query.leaves({ where: { id_in: parent.leaveIds } }, info)
}

module.exports = {
  leaves,
}
