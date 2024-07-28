import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Main from './pages/main';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import CharliePage from './pages/charliePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/main" element={<ProtectedRoute element={Main} requiredRole="nova" />} />
          <Route path="/" element={<Login />} />
          <Route path="/charlie" element={<ProtectedRoute element={CharliePage} requiredRole="charlie" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
