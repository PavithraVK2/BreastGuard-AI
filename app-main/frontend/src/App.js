import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import PredictionForm from '@/pages/PredictionForm';
import PredictionResult from '@/pages/PredictionResult';
import History from '@/pages/History';
import About from '@/pages/About';
import FeatureGlossary from '@/pages/FeatureGlossary';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatWidget from '@/components/ChatWidget';
import { useAuth } from '@/contexts/AuthContext';
import '@/App.css';

function AppRouter() {
  const location = window.location;
  const { user } = useAuth();
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/glossary" element={<ProtectedRoute><FeatureGlossary /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/prediction" element={<ProtectedRoute><PredictionForm /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><PredictionResult /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      </Routes>
      {user && <ChatWidget />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
