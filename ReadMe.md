## Mutations

- the below mutation will create new stand up details for a user. Now this is stepping through the api that was scaffolded by prisma. These mutations and queries will not be queryable by the client API we expose. instead you need to create something based on this api I would imagine.

```
mutation{
  createStandupDetails(
    data:{
      forUser:{
      	connect:{
        	id: "cjnxy25r6e8du0995uhu2mx7w"
        }
      }
    	timeTaken:1347,
    	notes:"here are some notes for a standup details"
    }) {
    id
    timeTaken
    forUser {
      id
      email
      standupDetails {
        id
        timeTaken
      }
    }
  }
}
```

In `src/resolvers/mutation.js` we will create our new mutation to expose to the client. Note make sure to check the bottom of the file to add our new mutation function

```
function createStandupDetails(parent, args, context, info) {
  return context.db.mutation.createStandupDetails(
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
```

You will also need to go into the `src/schema.graphql` file and add the following

```
  createStandupDetails(
    userId: ID!
    timeTaken: Int
    notes: String
  ): StandupDetails
```

Example of the above DB Mutation created as a client Mutation.
You could use this in your client to create a mutation

```
mutation {
  createStandupDetails(userId:"cjnxy25r6e8du0995uhu2mx7w",
    timeTaken:555, notes:"Here are some more notes") {
    id
    notes
    timeTaken
  }
}
```

In reality your mutation will look more like this so you can dynamically parse in the variables
![alt text](https://github.com/dunatron/nomos-dashboard-server/blob/master/documentation/img/standupDetailsMutation.png)

```
mutation deleteSection($sectionId:ID!){
  deleteSection(where: {id: $sectionId}) {
    id
  }
}
```
