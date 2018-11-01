const jwt = require("jsonwebtoken")
const APP_SECRET = "GraphQL-is-aw3some" // this is what we are issuing to our users. It is completely independent to the secret that’s specified in prisma.yml

function getUserId(context) {
  const Authorization = context.request.get("Authorization")
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "")
    const { userId } = jwt.verify(token, APP_SECRET)
    return userId
  }

  throw new Error("Not authenticated")
}

module.exports = {
  APP_SECRET,
  getUserId,
}
