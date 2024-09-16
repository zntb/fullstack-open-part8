const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const { GraphQLError } = require('graphql');

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
require('dotenv').config();
const Book = require('./models/book');
const Author = require('./models/author');

const MONGO_URI = process.env.MONGODB_URI;

console.log('connecting to', MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log('error connection to MongoDB:', error.message);
  });

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        console.log(await Book.find({}));
        return Book.find({}).populate('author');
      }

      if (args.author && !args.genre) {
        const author = await Author.findOne({ name: args.author });
        return await Book.find({ author });
      }

      if (!args.author && args.genre) {
        return await Book.find({ genres: { $in: [args.genre] } });
      }

      const author = await Author.findOne({ name: args.author });
      if (!author) {
        return [];
      }
      return await Book.find({
        author: author.id,
        genres: { $in: [args.genre] },
      });
    },
    allAuthors: async () => Author.find({}),
  },
  Author: {
    bookCount: async root => {
      const author = await Author.find({ name: root.name });
      const booksOfAuthor = await Book.countDocuments({ author });
      return booksOfAuthor;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const { title, author, published, genres } = args;

      try {
        const bookExists = await Book.findOne({ title });
        if (bookExists) {
          throw new GraphQLError('Book already exists', {
            extensions: {
              code: 'BOOK_ALREADY_EXISTS',
              invalidArgs: args,
            },
          });
        }

        let authorExists = await Author.findOne({ name: author });
        if (!authorExists) {
          const newAuthor = new Author({ name: author });
          authorExists = await newAuthor.save();
        }

        const newBook = new Book({
          title,
          author: authorExists._id,
          published,
          genres,
        });

        await newBook.save();
        return newBook.populate('author');
      } catch (error) {
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors)
            .map(e => e.message)
            .join(', ');

          throw new GraphQLError(`Validation error: ${validationErrors}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
            },
          });
        }

        throw error;
      }
    },

    editAuthor: async (root, args) => {
      const { name, setBornTo } = args;

      try {
        const author = await Author.findOne({ name });
        if (!author) {
          throw new GraphQLError('Author not found', {
            extensions: {
              code: 'AUTHOR_NOT_FOUND',
              invalidArgs: args,
            },
          });
        }

        author.born = setBornTo;
        await author.save();
        return author;
      } catch (error) {
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors)
            .map(e => e.message)
            .join(', ');

          throw new GraphQLError(`Validation error: ${validationErrors}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
            },
          });
        }

        throw error;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
