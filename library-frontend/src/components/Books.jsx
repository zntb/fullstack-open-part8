import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { ALL_BOOKS } from '../queries';

const Books = props => {
  const [selectedGenre, setSelectedGenre] = useState('all genres');

  const { loading, error, data } = useQuery(ALL_BOOKS, {
    fetchPolicy: 'cache-and-network',
  });

  if (!props.show) {
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const books = data.allBooks;

  const genres = [...new Set(books.flatMap(book => book.genres))];

  const filteredBooks =
    selectedGenre === 'all genres'
      ? books
      : books.filter(book => book.genres.includes(selectedGenre));

  return (
    <div>
      <h2>books</h2>
      <div>
        in genre <strong>{selectedGenre}</strong>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map(book => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {genres.map(genre => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setSelectedGenre('all genres')}>
          all genres
        </button>
      </div>
    </div>
  );
};

export default Books;
