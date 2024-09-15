import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Notify from './components/Notify';
import { ALL_BOOKS } from './queries';

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);

  const { loading } = useQuery(ALL_BOOKS);

  if (loading) return <div>Loading...</div>;

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
          <button>
            <Link to='/add'>add book</Link>
          </button>
        </nav>
        <Notify errorMessage={errorMessage} />

        <Routes>
          <Route path='/' element={<Authors show={true} setError={notify} />} />
          <Route path='/books' element={<Books show={true} />} />
          <Route
            path='/add'
            element={<NewBook show={true} setError={notify} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
