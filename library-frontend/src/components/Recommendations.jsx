import { useQuery } from '@apollo/client';
import { ALL_BOOKS, ME } from '../queries';

const Recommendations = () => {
  const { data: userData, loading: userLoading } = useQuery(ME, {
    fetchPolicy: 'network-only',
  });
  const {
    data: bookData,
    loading: bookLoading,
    error: bookError,
  } = useQuery(ALL_BOOKS, {
    variables: { genre: userData?.me?.favoriteGenre },
    skip: !userData?.me?.favoriteGenre,
    fetchPolicy: 'network-only',
  });

  if (!userLoading && !userData?.me?.username) return <div>Please login</div>;

  if (userLoading || bookLoading) return <div>Loading...</div>;
  if (bookError) return <div>Error: {bookError.message}</div>;

  const favoriteGenre = userData?.me?.favoriteGenre;
  const books =
    bookData?.allBooks?.filter(book => book.genres.includes(favoriteGenre)) ||
    [];

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map(book => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
