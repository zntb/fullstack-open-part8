const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
require('dotenv').config();
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');

const MONGO_URI = process.env.MONGODB_URI;
const HARDCODED_PASSWORD = 'password123';

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

  type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

  type Token {
    value: String!
}

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
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

    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {};

      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          filter.author = author._id;
        }
      }

      if (args.genre) {
        filter.genres = { $in: [args.genre] };
      }

      const books = await Book.find(filter).populate('author');

      return books.filter(book => book.author && book.author.name);
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    bookCount: async root => {
      const author = await Author.find({ name: root.name });
      const booksOfAuthor = await Book.countDocuments({ author });
      return booksOfAuthor;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError('Authentication required', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

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

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError('Authentication required', {
          extensions: {
            code: 'UNAUTHENTICATED',
            invalidArgs: args,
          },
        });
      }

      const { name, setBornTo } = args;
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
    },

    createUser: async (root, args) => {
      const { username, favoriteGenre } = args;

      const user = new User({ username, favoriteGenre });

      try {
        return await user.save();
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

    login: async (root, args) => {
      const { username, password } = args;

      const user = await User.findOne({ username });
      if (!user || password !== HARDCODED_PASSWORD) {
        throw new GraphQLError('Invalid credentials', {
          extensions: {
            code: 'UNAUTHENTICATED',
            invalidArgs: args,
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    // console.log('Authorization Header:', auth);

    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7);
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Decoded Token:', decodedToken);

        const currentUser = await User.findById(decodedToken.id);
        // console.log('Current User:', currentUser);

        return { currentUser };
      } catch (error) {
        // console.error('Token Verification Error:', error);
        return { currentUser: null };
      }
    }

    return { currentUser: null };
  },
});
