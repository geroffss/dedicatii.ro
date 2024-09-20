import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Main from './pages/main';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import CharliePage from './pages/charliePage';
import CharlieProfile from './pages/charlieProfile';
import { SuggestPage } from './pages/suggestPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/main"
            element={<ProtectedRoute element={Main} requiredRole="nova" />}
          />
          <Route
            path="/charlie/*"
            element={
              <ProtectedRoute element={CharliePage} requiredRole="charlie" />
            }
          />
          <Route
            path="/charlie/profile"
            element={
              <ProtectedRoute element={CharlieProfile} requiredRole="charlie" />
            }
          />
          <Route
            path="/charlie/:id/profile"
            element={
              <ProtectedRoute element={CharlieProfile} requiredRole="charlie" />
            }
          />
          <Route
            path="/suggest/*"
            element={
              <ProtectedRoute element={SuggestPage} requiredRole="charlie" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
