# Exercises 8.1.-8.7

Through the exercises, we will implement a GraphQL backend for a small library. Start with [this file](https://github.com/fullstack-hy2020/misc/blob/master/library-backend.js). Remember to `npm init` and to install dependencies!

## 8.1: The number of books and authors

Implement queries bookCount and authorCount which return the number of books and the number of authors.

The query

```graphql
query {
  bookCount
  authorCount
}
```

should return

```json
{
  "data": {
    "bookCount": 7,
    "authorCount": 5
  }
}
```

## 8.2: All books

Implement query allBooks, which returns the details of all books.

In the end, the user should be able to do the following query:

```graphql
query {
  allBooks {
    title
    author
    published
    genres
  }
}
```

## 8.3: All authors

Implement query `allAuthors`, which returns the details of all authors. The response should include a field `bookCount` containing the number of books the author has written.

For example the query

```graphql
query {
  allAuthors {
    name
    bookCount
  }
}
```

should return

```json
{
  "data": {
    "allAuthors": [
      {
        "name": "Robert Martin",
        "bookCount": 2
      },
      {
        "name": "Martin Fowler",
        "bookCount": 1
      },
      {
        "name": "Fyodor Dostoevsky",
        "bookCount": 2
      },
      {
        "name": "Joshua Kerievsky",
        "bookCount": 1
      },
      {
        "name": "Sandi Metz",
        "bookCount": 1
      }
    ]
  }
}
```

## 8.4: Books of an author

Modify the `allBooks` query so that a user can give an optional parameter author. The response should include only books written by that author.

For example query

```graphql
query {
  allBooks(author: "Robert Martin") {
    title
  }
}
```

should return

```json
{
  "data": {
    "allBooks": [
      {
        "title": "Clean Code"
      },
      {
        "title": "Agile software development"
      }
    ]
  }
}
```

## 8.5: Books by genre

Modify the query `allBooks` so that a user can give an optional parameter _genre_. The response should include only books of that genre.

For example query

```graphql
query {
  allBooks(genre: "refactoring") {
    title
    author
  }
}
```

should return

```json
{
  "data": {
    "allBooks": [
      {
        "title": "Clean Code",
        "author": "Robert Martin"
      },
      {
        "title": "Refactoring, edition 2",
        "author": "Martin Fowler"
      },
      {
        "title": "Refactoring to patterns",
        "author": "Joshua Kerievsky"
      },
      {
        "title": "Practical Object-Oriented Design, An Agile Primer Using Ruby",
        "author": "Sandi Metz"
      }
    ]
  }
}
```

The query must work when both optional parameters are given:

```graphql
query {
  allBooks(author: "Robert Martin", genre: "refactoring") {
    title
    author
  }
}
```

## 8.6: Adding a book

Implement mutation `addBook`, which can be used like this:

```graphql
mutation {
  addBook(
    title: "NoSQL Distilled"
    author: "Martin Fowler"
    published: 2012
    genres: ["database", "nosql"]
  ) {
    title
    author
  }
}
```

The mutation works even if the author is not already saved to the server:

```graphql
mutation {
  addBook(
    title: "Pimeyden tango"
    author: "Reijo Mäki"
    published: 1997
    genres: ["crime"]
  ) {
    title
    author
  }
}
```

If the author is not yet saved to the server, a new author is added to the system. The birth years of authors are not saved to the server yet, so the query

```graphql
query {
  allAuthors {
    name
    born
    bookCount
  }
}
```

returns

```json
{
  "data": {
    "allAuthors": [
      // ...
      {
        "name": "Reijo Mäki",
        "born": null,
        "bookCount": 1
      }
    ]
  }
}
```

## 8.7: Updating the birth year of an author

Implement mutation `editAuthor`, which can be used to set a birth year for an author. The mutation is used like so:

```graphql
mutation {
  editAuthor(name: "Reijo Mäki", setBornTo: 1958) {
    name
    born
  }
}
```

If the correct author is found, the operation returns the edited author:

```json
{
  "data": {
    "editAuthor": {
      "name": "Reijo Mäki",
      "born": 1958
    }
  }
}
```

If the author is not in the system, null is returned:

```json
{
  "data": {
    "editAuthor": null
  }
}
```

## Exercises 8.13.-8.16

The following exercises are quite likely to break your frontend. Do not worry about it yet; the frontend shall be fixed and expanded in the next chapter.

### 8.13: Database, part 1

Change the library application so that it saves the data to a database. You can find the `mongoose schema` for books and authors from [here](https://github.com/fullstack-hy/misc/blob/main/library-schema.md).

Let's change the book graphql schema a little

```graphql
type Book {
  title: String!
  published: Int!

  author: Author!
  genres: [String!]!
  id: ID!
}
```

so that instead of just the author's name, the book object contains all the details of the author.

You can assume that the user will not try to add faulty books or authors, so you don't have to care about validation errors.

The following things do not have to work just yet:

- allBooks query with parameters
- bookCount field of an author object
- author field of a book
- editAuthor mutation

**Note:** despite the fact that author is now an _object_ within a book, the schema for adding a book can remain same, only the _name_ of the author is given as a parameter

```graphql
type Mutation {
  addBook(
    title: String!

    author: String!
    published: Int!
    genres: [String!]!
  ): Book!
  editAuthor(name: String!, setBornTo: Int!): Author
}
```

### 8.14: Database, part 2

Complete the program so that all queries (to get `allBooks` working with the parameter `author` and `bookCount` field of an author object is not required) and mutations work.

Regarding the `genre` parameter of the all books query, the situation is a bit more challenging. The solution is simple, but finding it can be a headache. You might benefit from [this](https://www.mongodb.com/docs/manual/tutorial/query-array-of-documents/).

### 8.15 Database, part 3

Complete the program so that database validation errors (e.g. book title or author name being too short) are handled sensibly. This means that they cause [GraphQLError](https://www.apollographql.com/docs/apollo-server/data/errors/#custom-errors) with a suitable error message to be thrown.

### 8.16 user and logging in

Add user management to your application. Expand the schema like so:

```graphql
type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  // ..
  me: User
}

type Mutation {
  // ...
  createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}
```

Create resolvers for query `me` and the new mutations `createUser` and `login`. Like in the course material, you can assume all users have the same hardcoded password.

Make the mutations `addBook` and `editAuthor` possible only if the request includes a valid token.

(Don't worry about fixing the frontend for the moment.)

### 8.23: Subscriptions - server

Do a backend implementation for subscription `bookAdded`, which returns the details of all new books to its subscribers.

### 8.26: n+1

Solve the n+1 problem of the following query using any method you like.

```graphql
query {
  allAuthors {
    name
    bookCount
  }
}
```
