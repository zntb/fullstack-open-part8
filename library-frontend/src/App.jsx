import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';

const App = () => {
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

        <Routes>
          <Route path='/' element={<Authors show={true} />} />
          <Route path='/books' element={<Books show={true} />} />
          <Route path='/add' element={<NewBook show={true} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
