import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../queries';
import AuthorBirthForm from './AuthorBirthForm';

const Authors = ({ show, setError }) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS, {
    fetchPolicy: 'cache-and-network',
  });

  if (!show) {
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const authors = data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(a => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born ? a.born : ''}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AuthorBirthForm authors={authors} setError={setError} />
    </div>
  );
};

export default Authors;
