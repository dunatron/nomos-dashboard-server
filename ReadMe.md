## Mutations

##Tutorials

- https://medium.com/@sternwebagency/lets-write-a-chat-with-graphql-and-react-b4216293baff

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

To get all the stand up details

```
query {
  getStandupDetails {
    id
    notes
    timeTaken
    createdAt
    forUser {
      name
    }
  }
}
```

The following query is an example on how to create a db mutation for creating leave

![alt text](https://github.com/dunatron/nomos-dashboard-server/blob/master/documentation/img/db_leave_mutation_example.png)

```
mutation createLeave(
  $lastDayOfWork: DateTime!
  $firstDayOfLeave: DateTime!
  $lastDayOfLeave: DateTime!
  $firstDayOfWork: DateTime!
  $daysOfLeave: Int!
  $publicHolidays: Int!
  $totalLeaveDays: Int!
  $type:LEAVE_TYPE
){
  createLeave( data:{
    lastDayOfWork: $lastDayOfWork
    firstDayOfLeave:$firstDayOfLeave
    lastDayOfLeave: $lastDayOfLeave
    firstDayOfWork: $firstDayOfWork
    daysOfLeave: $daysOfLeave
    publicHolidays: $publicHolidays
    totalLeaveDays: $totalLeaveDays
    type: $type
    forUser: {connect: {id: "cjnxy25r6e8du0995uhu2mx7w"}}
  }) {
    id
    totalLeaveDays
  }
}
```

Query variables for above query

```
{
  "lastDayOfWork": "2015-03-25T12:00:00-06:30",
  "firstDayOfLeave":"2015-03-25T12:00:00-06:30",
  "lastDayOfLeave":"2015-03-25T12:00:00-06:30",
  "firstDayOfWork":"2015-03-25T12:00:00-06:30",
  "daysOfLeave":1,
	"publicHolidays":1,
  "totalLeaveDays":2,
  "type": "ANNUAL_LEAVE"
}
```

Get all of the Leave in the system

```
query {
  getAllLeave {
    lastDayOfWork
    firstDayOfLeave
    lastDayOfLeave
    firstDayOfWork
    daysOfLeave
    publicHolidays
    totalLeaveDays
    forUser {
      id
      name
    }
  }
}
```

Change user role in the DB

```
mutation acceptLeave($id:ID!) {
  updateLeave(where:{id:$id} data:{status:ACCEPTED}) {
    id
    status
  }
}
```

CLient Query

```
mutation acceptLeave($id:ID!) {
  acceptLeave(id:$id) {
    id
    status
  }
}
```

function created on the craphql server to handle the above client query

```
function acceptLeave(parent, args, context, info) {
  return context.db.mutation.updateLeave(
    {
      data: {
        status: "ACCEPTED",
      },
      where: { id: args.id },
    },
    info
  )
}
```
