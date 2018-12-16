function createCodeTag(parent, args, context, info) {
  return context.db.mutation.createCodeTag(
    {
      data: {
        name: args.name,
      },
    },
    info
  )
}

async function createCode(parent, args, context, info) {
  const code = await context.db.mutation.createCodeSnippet(
    {
      data: { ...args.data },
    },
    info
  )
  return code
}

async function createCodeLink(parent, args, context, info) {
  const code = await context.db.mutation.createCodeLink(
    {
      data: { ...args.data },
    },
    info
  )
  return code
}

module.exports = {
  createCodeTag,
  createCode,
  createCodeLink,
}
