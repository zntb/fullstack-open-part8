import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Notify from './components/Notify';
import LoginForm from './components/LoginForm';
import { useApolloClient } from '@apollo/client';

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [token, setToken] = useState(null);

  const client = useApolloClient();

  useEffect(() => {
    const token = localStorage.getItem('phonenumbers-user-token');
    if (token) {
      setToken(token);
    }
  }, []);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('phonenumbers-user-token');
    client.resetStore();
  };

  const notify = message => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  return (
    <Router>
      <div>
        <nav>
          <button>
            <Link to='/'>authors</Link>
          </button>
          <button>
            <Link to='/books'>books</Link>
          </button>
          {token ? (
            <>
              <button>
                <Link to='/add'>add book</Link>
              </button>
              <button onClick={logout}>logout</button>
            </>
          ) : (
            <button>
              <Link to='/login'>login</Link>
            </button>
          )}
        </nav>

        <Notify errorMessage={errorMessage} />

        <Routes>
          <Route path='/' element={<Authors show={true} setError={notify} />} />
          <Route path='/books' element={<Books show={true} />} />
          <Route
            path='/add'
            element={<NewBook show={true} setError={notify} />}
          />
          {!token && (
            <Route
              path='/login'
              element={<LoginForm setToken={setToken} setError={notify} />}
            />
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
