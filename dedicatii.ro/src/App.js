import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Main from './pages/main';
import ProtectedRoute from './components/ProtectedRoute';
import Callback from './components/SpotifyCallback'; // Import the Spotify callback handler
import CharliePage from './pages/charliePage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/main" element={<ProtectedRoute element={Main} requiredRole="nova" />} />
          <Route path="/charlie/*" element={<ProtectedRoute element={CharliePage} requiredRole="charlie" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
