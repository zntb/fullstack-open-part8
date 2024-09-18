import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Recommendations from './components/Recommendations';
import Notify from './components/Notify';
import LoginForm from './components/LoginForm';
import { useApolloClient, useSubscription } from '@apollo/client';
import { BOOK_ADDED, ALL_BOOKS } from './queries';

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [token, setToken] = useState(null);

  const client = useApolloClient();

  useEffect(() => {
    const savedToken = localStorage.getItem('phonenumbers-user-token');
    if (savedToken) {
      setToken(savedToken);
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

  const updateCacheWith = addedBook => {
    const dataInStore = client.readQuery({ query: ALL_BOOKS });
    if (!dataInStore) return;

    const alreadyInStore = dataInStore.allBooks.some(
      book => book.id === addedBook.id,
    );
    if (alreadyInStore) return;

    client.writeQuery({
      query: ALL_BOOKS,
      data: {
        allBooks: dataInStore.allBooks.concat(addedBook),
      },
    });
  };

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      notify(`New book added: ${addedBook.title} by ${addedBook.author.name}`);
      updateCacheWith(addedBook);
    },
  });

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
              <button>
                <Link to='/recommend'>recommend</Link>
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
          <Route path='/recommend' element={<Recommendations />} />
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
