function createTag(parent, args, context, info) {
  return context.db.mutation.createTag(
    {
      data: {
        name: args.name,
      },
    },
    info
  )
}

module.exports = {
  createTag,
}
