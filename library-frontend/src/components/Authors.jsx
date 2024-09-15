import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries';

const Authors = ({ show, setError }) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: error => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n');
      setError(messages);
    },
  });

  if (!show) {
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const authors = data.allAuthors;

  const submit = async event => {
    event.preventDefault();

    await editAuthor({
      variables: { name, setBornTo: Number(born) },
    });

    setName('');
    setBorn('');
  };

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

      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <input
            type='text'
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            type='number'
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  );
};

export default Authors;
