import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries';

const AuthorBirthForm = ({ authors, setError }) => {
  const [name, setName] = useState(authors[0]?.name || '');
  const [born, setBorn] = useState('');

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: error => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n');
      setError(messages);
    },
  });

  const submit = async event => {
    event.preventDefault();

    if (!born) {
      setError('Birth year is required.');
      return;
    }

    if (isNaN(born)) {
      setError('Birth year must be a valid number.');
      return;
    }

    await editAuthor({
      variables: { name, setBornTo: Number(born) },
    });

    setBorn('');
  };

  return (
    <div>
      <h3>Set birth year</h3>
      <form onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map(author => (
              <option key={author.name} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type='number'
            value={born}
            onChange={({ target }) =>
              setBorn(target.value ? Number(target.value) : '')
            }
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  );
};

export default AuthorBirthForm;
