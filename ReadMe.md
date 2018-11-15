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

Query the leave feed

```
query LeaveFeedQuery(
  $filter: String
  $first: Int
  $skip: Int
  $betweenFilter:[DateTime!]
  $orderBy:LeaveOrderByInput
) {
  leaveFeed(
    betweenFilter: $betweenFilter,
    filter: $filter,
    first: $first,
    skip: $skip,
    orderBy:$orderBy
  ) {
    count
    leaves {
      id
      status
      notes
      createdAt
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
}
```

![alt text](https://github.com/dunatron/nomos-dashboard-server/blob/master/documentation/img/query_leave_feed.png)

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

## Nomos Stock Answer Search

### DataModel

```
type Question {
  id: ID! @unique
  name: String! @unique
  answers: [Answer!]! @relation(name: "QuestionAnswers", onDelete: CASCADE)
  tags: [Tag!]! @relation(name: "QuestionTags", onDelete: SET_NULL)
  notes: [QuestionNote!]! @relation(name: "QuestionNotes", onDelete: CASCADE)
  links: [QuestionLink!]! @relation(name: "QuestionLinks", onDelete: SET_NULL)
}

type Answer {
  id: ID! @unique
  question: Question @relation(name: "QuestionAnswers")
  response: String!
  notes: [AnswerNote!]! @relation(name: "AnswerNotes", onDelete: CASCADE)
  links: [AnswerLink!]! @relation(name: "AnswerLinks", onDelete: SET_NULL)
}

type Tag {
  id: ID! @unique
  name: String!
  questions: [Question!]! @relation(name: "QuestionTags")
}

type QuestionLink {
  id: ID! @unique
  name: String! @unique
  url: String!
  questions: [Question!]! @relation(name: "QuestionLinks")
}

type QuestionNote {
  id: ID! @unique
  content: String!
  question: Question @relation(name: "QuestionNotes")
}

type AnswerLink {
  id: ID! @unique
  name: String! @unique
  url: String!
  answers: [Answer!]! @relation(name: "AnswerLinks")
}

type AnswerNote {
  id: ID! @unique
  content: String!
  answer: Answer @relation(name: "AnswerNotes")
}
```

Create a new Question with new answers

```
mutation {
  createQuestion(data:{name: "Question 10." answers:{create:[
    {response:"answer 1"},
    {response:"answer 2"}
  ]}}) {
    id
    name
    answers {
      id
    }
  }
}
```

This mutation creates a new question with 3 answers.
Two of these answers are new and created on the fly.
One of these has already been created and we are just associating it with the question. Note: our business logic of having an answer associted with 1 question only still remains true. It just means we can create questions withought knowing what question to attach to yet. or being lazy.

```
mutation {
  createQuestion(data:{name: "Question 12." answers:{create:[
    {response:"answer 1"},
    {response:"answer 2"}
  ] connect:{
    id: "cjoj65rod3fpy0a64ev943mbq"
  }}}) {
    id
    name
    answers {
      id
      response
    }
  }
}
```

The actual mutation a client(front-end) can make

```
mutation createQuestion {
  createQuestion(data:{
    name:"Question 1005"
    answers:{
      create:[
        {response:"Answer 1"},
        {response:"Answer 2"}
      ]
    }
    notes:{
      create: [
        {content:"Anote about this question"},
        {content:"Ohh look another note for this question"}
      ]
    }
    links:{
      create:[
        {name:"link 1", url:"https://www.prisma.io"},
        {name:"Prisma Docs", url:"https://www.prisma.io/docs"},
      ]
    }
  }) {
    id
    name
    answers {
      id
      response
    }
    notes {
      id
      content
    }
    links {
      id
      name
      url
    }
  }
}
```

The above mutation would return the following response

```
{
  "data": {
    "createQuestion": {
      "id": "cjoj8bgri3q7v0a641cbyk4so",
      "name": "Question 1005",
      "answers": [
        {
          "id": "cjoj8bgrq3q7w0a64z68rz4j0",
          "response": "Answer 1"
        },
        {
          "id": "cjoj8bgrt3q7y0a64u7ji0xuw",
          "response": "Answer 2"
        }
      ],
      "notes": [
        {
          "id": "cjoj8bgrx3q800a64ex4hq6mz",
          "content": "Anote about this question"
        },
        {
          "id": "cjoj8bgs03q820a64cemgq7z1",
          "content": "Ohh look another note for this question"
        }
      ],
      "links": [
        {
          "id": "cjoj8bgs63q840a64zl23s0bd",
          "name": "link 1",
          "url": "https://www.prisma.io"
        },
        {
          "id": "cjoj8bgs93q860a64qcxsj5cd",
          "name": "Prisma Docs",
          "url": "https://www.prisma.io/docs"
        }
      ]
    }
  }
```
