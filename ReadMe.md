## Mutations

##Tutorials

- https://medium.com/@sternwebagency/lets-write-a-chat-with-graphql-and-react-b4216293baff

- the below mutation will create new stand up details for a user. Now this is stepping through the api that was scaffolded by prisma. These mutations and queries will not be queryable by the client API we expose. instead you need to create something based on this api I would imagine.

```JS
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

```JS
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

```JS
  createStandupDetails(
    userId: ID!
    timeTaken: Int
    notes: String
  ): StandupDetails
```

Example of the above DB Mutation created as a client Mutation.
You could use this in your client to create a mutation

```JS
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

```JS
mutation deleteSection($sectionId:ID!){
  deleteSection(where: {id: $sectionId}) {
    id
  }
}
```

To get all the stand up details

```JS
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

```JS
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

```JS
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

```JS
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

```JS
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

```JS
mutation acceptLeave($id:ID!) {
  updateLeave(where:{id:$id} data:{status:ACCEPTED}) {
    id
    status
  }
}
```

CLient Query

```JS
mutation acceptLeave($id:ID!) {
  acceptLeave(id:$id) {
    id
    status
  }
}
```

function created on the craphql server to handle the above client query

```JS
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

```JS
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

```JS
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

```JS
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

```JS
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

```JS
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

### create Question mutation

![alt text](https://github.com/dunatron/nomos-dashboard-server/blob/master/documentation/img/create_question_mutation.png)

### create question mutation query variables

![alt text](https://github.com/dunatron/nomos-dashboard-server/blob/master/documentation/img/create_question_mutation_variables.png)

#### Searching Questions

```JS
query searchQuestions($search:String) {
  questions(where:{name_contains: $search}) {
    id
    name
    links {
      id
    }
  }
}
```

#### Question Feed

```JS
query questionFeed(
  $filter: String
  $skip: Int
  $first: Int
  $orderBy: QuestionOrderByInput
) {
  questionFeed(filter: $filter, skip: $skip, first: $first, orderBy: $orderBy) {
    questions {
      id
      name
      answers {
        id
        response
      }
      links {
        id
        name
        url
      }
      notes {
        id
        content
      }
      tags {
        id
        name
      }
    }
  }
}

```

Query variables for questionFeed

```JS
{
  "filter": "",
  "skip":0,
  "first":10,
  "orderBy": "name_ASC"
}
```

### Update Question

```JS
mutation updateQuestion($id:ID!, $data:QuestionUpdateInput!){
  updateQuestion(id:$id, data:$data) {
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

#### The query variable for updateQuestion

```JS
{
  "id":"cjojb93fz40v30a64euqj93w1",
  "data": {
    "answers": {
      "update": [
        {"where":
          {
            "id": "cjop5yokerjx50a6413b540m2" },
          	"data": {
              "response": "here is an update to an answer"
            }
        }
      ],
      "create": [
        {"response": "Here is a new answer" }
      ]
    }
  }
}
```

## Code Keeper

#### Queries

###### searchCode

```JS
query searchCode($search:String!) {
  codeSearch(search:$search) {
    id
    name
    content
    tags {
      name
    }
    links {
      id
      name
      url
    }
  }
}
// variables
{
  "search": "code snippet 2"
}
```

#### Mutations

###### createCodeTag

```JS
mutation createCodeTag($name: String!) {
  createCodeTag(name:$name) {
    name
  }
}
```

###### createCode

```JS
mutation createCode($data: CodeSnippetCreateInput) {
  createCode(data: $data) {
    name
    content
    note
    tags {
      name
    }
    links {
      id
      name
      url
    }
  }
}
// The query variables
{
  "data": {
    "name": "Here is an example name again again",
    "content": "The content for this code snippet",
    "tags": {
      "connect": [
        {
          "name": "javascript"
        },
         {
          "name": "Php"
        }
      ]
    },
    "links": {
      "create": [
        {"name": "I am link 1", "url": "https://google.com" }
      ]
    }
  }
}
```

###### updateCodeSnippet

```JS
mutation updateCode($codeId:ID! $data: CodeSnippetUpdateInput!) {
  updateCodeSnippet(where:{id: $codeId} data: $data) {
    id
   	name
    content
    note
    tags {
      name
    }
    links {
      id
      name
      url
    }
  }
}
// The variables
{
  "codeId": "cjprf9yi3b3ji0a84heo6j7cz",
  "data":{
    "name": "I am the code name updated",
    "content": "Iam a living Pion, ear near zion",
    "note": "I am an updated note, so please dear god, not them",
    "tags": {
      "disconnect": [
        {"name": "javascript"}
      ],
      "connect": [
        { "name": "Php" }
      ]
    },
    "links": {
      "delete": [
       {"id": "cjprfirfhmfqb0a42e25k0nq5"}
      ],
      "create": [
        { "name": "I am a new link name", "url": "https://bity.bin" }
      ]
    }
  }
}
```

###### deleteCodeSnippet

```JS
mutation deleteCode($id:ID!) {
  deleteCodeSnippet(where: {id:$id}) {
    id
    name
  }
}
// variables
{
  "id":"cjprfpg0nmgn20a42gjtwjat4"
}
```

###### deleteCodeTag

```JS
mutation deleteCodeTag($name:String!) {
  deleteCodeTag(where: {name:$name}) {
    name
  }
}
// variables
{
  "name":"javascript"
}
```

## country codes

```

Code▲	Country Name▲▼
AED	United Arab Emirates Dirham
AFN	Afghanistan Afghani
ALL	Albania Lek
AMD	Armenia Dram
ANG	Netherlands Antilles Guilder
AOA	Angola Kwanza
ARS	Argentina Peso
AUD	Australia Dollar
AWG	Aruba Guilder
AZN	Azerbaijan Manat
BAM	Bosnia and Herzegovina Convertible Marka
BBD	Barbados Dollar
BDT	Bangladesh Taka
BGN	Bulgaria Lev
BHD	Bahrain Dinar
BIF	Burundi Franc
BMD	Bermuda Dollar
BND	Brunei Darussalam Dollar
BOB	Bolivia Bolíviano
BRL	Brazil Real
BSD	Bahamas Dollar
BTN	Bhutan Ngultrum
BWP	Botswana Pula
BYN	Belarus Ruble
BZD	Belize Dollar
CAD	Canada Dollar
CDF	Congo/Kinshasa Franc
CHF	Switzerland Franc
CLP	Chile Peso
CNY	China Yuan Renminbi
COP	Colombia Peso
CRC	Costa Rica Colon
CUC	Cuba Convertible Peso
CUP	Cuba Peso
CVE	Cape Verde Escudo
CZK	Czech Republic Koruna
DJF	Djibouti Franc
DKK	Denmark Krone
DOP	Dominican Republic Peso
DZD	Algeria Dinar
EGP	Egypt Pound
ERN	Eritrea Nakfa
ETB	Ethiopia Birr
EUR	Euro Member Countries
FJD	Fiji Dollar
FKP	Falkland Islands (Malvinas) Pound
GBP	United Kingdom Pound
GEL	Georgia Lari
GGP	Guernsey Pound
GHS	Ghana Cedi
GIP	Gibraltar Pound
GMD	Gambia Dalasi
GNF	Guinea Franc
GTQ	Guatemala Quetzal
GYD	Guyana Dollar
HKD	Hong Kong Dollar
HNL	Honduras Lempira
HRK	Croatia Kuna
HTG	Haiti Gourde
HUF	Hungary Forint
IDR	Indonesia Rupiah
ILS	Israel Shekel
IMP	Isle of Man Pound
INR	India Rupee
IQD	Iraq Dinar
IRR	Iran Rial
ISK	Iceland Krona
JEP	Jersey Pound
JMD	Jamaica Dollar
JOD	Jordan Dinar
JPY	Japan Yen
KES	Kenya Shilling
KGS	Kyrgyzstan Som
KHR	Cambodia Riel
KMF	Comorian Franc
KPW	Korea (North) Won
KRW	Korea (South) Won
KWD	Kuwait Dinar
KYD	Cayman Islands Dollar
KZT	Kazakhstan Tenge
LAK	Laos Kip
LBP	Lebanon Pound
LKR	Sri Lanka Rupee
LRD	Liberia Dollar
LSL	Lesotho Loti
LYD	Libya Dinar
MAD	Morocco Dirham
MDL	Moldova Leu
MGA	Madagascar Ariary
MKD	Macedonia Denar
MMK	Myanmar (Burma) Kyat
MNT	Mongolia Tughrik
MOP	Macau Pataca
MRU	Mauritania Ouguiya
MUR	Mauritius Rupee
MVR	Maldives (Maldive Islands) Rufiyaa
MWK	Malawi Kwacha
MXN	Mexico Peso
MYR	Malaysia Ringgit
MZN	Mozambique Metical
NAD	Namibia Dollar
NGN	Nigeria Naira
NIO	Nicaragua Cordoba
NOK	Norway Krone
NPR	Nepal Rupee
NZD	New Zealand Dollar
OMR	Oman Rial
PAB	Panama Balboa
PEN	Peru Sol
PGK	Papua New Guinea Kina
PHP	Philippines Peso
PKR	Pakistan Rupee
PLN	Poland Zloty
PYG	Paraguay Guarani
QAR	Qatar Riyal
RON	Romania Leu
RSD	Serbia Dinar
RUB	Russia Ruble
RWF	Rwanda Franc
SAR	Saudi Arabia Riyal
SBD	Solomon Islands Dollar
SCR	Seychelles Rupee
SDG	Sudan Pound
SEK	Sweden Krona
SGD	Singapore Dollar
SHP	Saint Helena Pound
SLL	Sierra Leone Leone
SOS	Somalia Shilling
SPL*	Seborga Luigino
SRD	Suriname Dollar
STN	São Tomé and Príncipe Dobra
SVC	El Salvador Colon
SYP	Syria Pound
SZL	eSwatini Lilangeni
THB	Thailand Baht
TJS	Tajikistan Somoni
TMT	Turkmenistan Manat
TND	Tunisia Dinar
TOP	Tonga Pa'anga
TRY	Turkey Lira
TTD	Trinidad and Tobago Dollar
TVD	Tuvalu Dollar
TWD	Taiwan New Dollar
TZS	Tanzania Shilling
UAH	Ukraine Hryvnia
UGX	Uganda Shilling
USD	United States Dollar
UYU	Uruguay Peso
UZS	Uzbekistan Som
VEF	Venezuela Bolívar
VND	Viet Nam Dong
VUV	Vanuatu Vatu
WST	Samoa Tala
XAF	Communauté Financière Africaine (BEAC) CFA Franc BEAC
XCD	East Caribbean Dollar
XDR	International Monetary Fund (IMF) Special Drawing Rights
XOF	Communauté Financière Africaine (BCEAO) Franc
XPF	Comptoirs Français du Pacifique (CFP) Franc
YER	Yemen Rial
ZAR	South Africa Rand
ZMW	Zambia Kwacha
ZWD	Zimbabwe Dollar
```
