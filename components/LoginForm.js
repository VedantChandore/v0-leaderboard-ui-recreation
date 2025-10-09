'use client'

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Cloud, Mail, Lock, Eye, EyeOff, Sparkles, Trophy, Star, Zap, Users, Award } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/25 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-32 right-32 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-32 w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Enhanced Header Section */}
        <div className="text-center mb-8">

          
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Google Cloud Learning Platform</span>
            </div>
          </div>

        </div>

        <Card className="bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-2xl hover:shadow-3xl transition-shadow duration-300 relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          
          <CardHeader className="text-center space-y-4 pb-6 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-full">
                <Trophy className="h-4 w-4 text-amber-600" />
                <Zap className="h-4 w-4 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                {isSignUp ? 'Join the Competition' : 'Welcome Back, Champion'}
              </CardTitle>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isSignUp 
                ? '🚀 Create your account to join the leaderboard and showcase your Google Cloud skills to the world!' 
                : '⚡ Ready to climb the ranks? Sign in to track your progress and dominate the competition!'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-gray-50/80 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:bg-gray-50 transition-colors text-base"
                  required
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-gray-50/80 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:bg-gray-50 transition-colors text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-3 text-red-600 text-sm bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-4 rounded-xl shadow-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 font-semibold text-base transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Getting you ready...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5" />
                    <span>{isSignUp ? '🎯 Join Leaderboard' : '🚀 Access Dashboard'}</span>
                    <Zap className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-white/90 text-gray-500 font-semibold backdrop-blur-sm rounded-full border border-gray-200/60">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full h-14 border-2 border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-semibold text-base">Continue with Google</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
                  <div className="w-1 h-1 bg-red-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-600">
                  {isSignUp ? '🏆 Already competing?' : "🎯 Ready to compete?"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all duration-200 transform hover:scale-105"
                >
                  {isSignUp ? 'Sign In' : 'Join Now'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <div className="text-center mt-8 space-y-4">
          
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Real-time Updates
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Instant Rankings
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Fair Competition
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}