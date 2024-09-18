import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN, ME } from '../queries';

const LoginForm = ({ setToken, setError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const [login] = useMutation(LOGIN, {
    onError: error => {
      setError(error.graphQLErrors[0]?.message || 'Something went wrong');
    },
    onCompleted: () => {
      navigate('/');
    },

    refetchQueries: [{ query: ME }],
  });

  const handleLogin = async event => {
    event.preventDefault();

    try {
      const result = await login({ variables: { username, password } });

      if (result.data) {
        const token = result.data.login.value;
        setToken(token);
        localStorage.setItem('phonenumbers-user-token', token);
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          Username{' '}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          Password{' '}
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
