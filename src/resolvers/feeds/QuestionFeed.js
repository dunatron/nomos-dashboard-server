function questions(parent, args, context, info) {
  return context.db.query.questions(
    { where: { id_in: parent.questionIds } },
    info
  )
}

module.exports = {
  questions,
}
