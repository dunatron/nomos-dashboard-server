const { GraphQLServer } = require("graphql-yoga")
const { Prisma } = require("prisma-binding")
const Query = require("./resolvers/Query")
const Mutation = require("./resolvers/Mutation")
const AuthPayload = require("./resolvers/AuthPayload")
const Subscription = require("./resolvers/Subscription")
const LeaveFeed = require("./resolvers/LeaveFeed")
const QuestionFeed = require("./resolvers/feeds/QuestionFeed")

const resolvers = {
  Query,
  Mutation,
  AuthPayload,
  Subscription,
  LeaveFeed,
  QuestionFeed,
}

// 3
const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: "src/generated/prisma.graphql",
      endpoint:
        "https://us1.prisma.sh/heath-dunlop-37e897/nomos-dashboard-db/dev",
      secret: "nomossecretshhh",
      debug: true,
    }),
  }),
})
server.start(() => console.log(`Server is running on http://localhost:4000`))
