const { GraphQLError } = require('graphql');

const handleValidationError = (error, args) => {
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors)
      .map(e => e.message)
      .join(', ');
    throw new GraphQLError(`Validation error: ${validationErrors}`, {
      extensions: { code: 'BAD_USER_INPUT', invalidArgs: args },
    });
  }
  throw error;
};

module.exports = { handleValidationError };
