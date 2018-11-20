function updateQuestion(parent, args, context, info) {
  return context.db.mutation.updateQuestion(
    {
      where: {
        id: args.id,
      },
      data: { ...args.data },
    },
    info
  )
}

module.exports = {
  updateQuestion,
}
