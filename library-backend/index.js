require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const User = require('./models/user');

connectDB(process.env.MONGODB_URI);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7);
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decodedToken.id);
        return { currentUser };
      } catch (error) {
        console.error('Token Verification Error:', error);
      }
    }
    return { currentUser: null };
  },
});
