// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Treatments from './pages/Treatments';
import Livestock from './pages/Livestock';
import Farms from './pages/Farm';
import Reports from './pages/Reports';
import Loader from './components/UI/Loader';
import Test from './Test';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/test" element={<Test />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/treatments" element={
              <ProtectedRoute>
                <Layout>
                  <Treatments />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/livestock" element={
              <ProtectedRoute>
                <Layout>
                  <Livestock />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/farms" element={
              <ProtectedRoute>
                <Layout>
                  <Farms />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;