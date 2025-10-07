'use client'

import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/LoginForm';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC04]">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return children;
}