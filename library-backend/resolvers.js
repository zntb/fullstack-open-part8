const jwt = require('jsonwebtoken');
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');
const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const { handleValidationError } = require('./utils/handleErrors');

const pubsub = new PubSub();
const BOOK_ADDED = 'BOOK_ADDED';

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {};
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) filter.author = author._id;
      }
      if (args.genre) filter.genres = { $in: [args.genre] };
      return Book.find(filter).populate('author').exec();
    },
    allAuthors: async () => {
      return await Author.find({});
    },
    me: (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return context.currentUser;
    },
  },

  Author: {
    bookCount: async root => {
      const author = await Author.findOne({ name: root.name });
      return Book.countDocuments({ author });
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser)
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });

      const { title, author, published, genres } = args;

      try {
        const existingBook = await Book.findOne({ title });
        if (existingBook)
          throw new GraphQLError('Book already exists', {
            extensions: { code: 'BOOK_ALREADY_EXISTS' },
          });

        let authorExists = await Author.findOne({ name: author });
        if (!authorExists)
          authorExists = await new Author({ name: author }).save();

        const newBook = await new Book({
          title,
          author: authorExists._id,
          published,
          genres,
        }).save();

        const populatedBook = await newBook.populate('author');

        pubsub.publish(BOOK_ADDED, { bookAdded: populatedBook });

        return populatedBook;
      } catch (error) {
        handleValidationError(error, args);
      }
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser)
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });

      const author = await Author.findOne({ name: args.name });
      if (!author)
        throw new GraphQLError('Author not found', {
          extensions: { code: 'AUTHOR_NOT_FOUND' },
        });

      author.born = args.setBornTo;
      return author.save();
    },

    createUser: async (root, args) => {
      try {
        return await new User({
          username: args.username,
          favoriteGenre: args.favoriteGenre,
        }).save();
      } catch (error) {
        handleValidationError(error, args);
      }
    },

    login: async (root, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user || password !== process.env.HARDCODED_PASSWORD) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWT_SECRET,
      );
      return { value: token };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator([BOOK_ADDED]),
    },
  },
};

module.exports = resolvers;
