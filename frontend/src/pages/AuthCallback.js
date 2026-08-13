import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000'}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Invalid session');
          navigate('/login');
          return;
        }

        const response = await axios.post(
          `${API}/auth/google/session`,
          {},
          {
            headers: { 'X-Session-ID': sessionId },
            withCredentials: true
          }
        );

        login(response.data, response.data.session_token);
        toast.success('Successfully logged in!');
        navigate('/dashboard', { state: { user: response.data }, replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    processSession();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#0284C7] mx-auto mb-4" />
        <p className="text-[#475569]">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
