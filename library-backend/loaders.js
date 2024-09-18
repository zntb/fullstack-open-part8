const DataLoader = require('dataloader');
const Book = require('./models/book');

const bookCountLoader = new DataLoader(async authorIds => {
  const books = await Book.aggregate([
    { $match: { author: { $in: authorIds } } },
    { $group: { _id: '$author', count: { $sum: 1 } } },
  ]);

  const bookCountMap = books.reduce((acc, book) => {
    acc[book._id] = book.count;
    return acc;
  }, {});

  return authorIds.map(authorId => bookCountMap[authorId] || 0);
});

module.exports = { bookCountLoader };
