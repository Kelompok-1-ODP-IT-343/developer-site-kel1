'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginBlueprint } from '@/services/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;

    if (!identifier || !password) {
      setError('Please enter both Developer ID and password');
      setLoading(false);
      return;
    }

    try {
      const result = await loginBlueprint({ identifier, password });
      if (result.success) {
        // Redirect to dashboard only if login is successful
        router.push('/dashboard');
      } else {
        // Show specific error messages
        if (result.message && result.message.includes('Access denied')) {
          setError('Invalid credentials. Please check your Developer ID and password.');
        } else {
          setError(result.message || 'Failed to login. Please check your credentials.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.response?.status === 401) {
        setError('Invalid credentials. Please check your Developer ID and password.');
      } else if (err?.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network connection.');
      } else {
        setError(err?.response?.data?.message || 'An error occurred while logging in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="akun min-h-screen flex">
      {/* === LEFT SIDE === */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <img
          src="/logo-satuatap.png"
          alt="Satu Atap Logo"
          className="w-[500px] h-auto object-contain"
        />
      </div>

      {/* === RIGHT SIDE === */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-sm shadow-xl border border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              BNI KPR - Satu Atap
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              Please enter your Developer ID and password to login.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="identifier">Developer ID</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="Enter your Developer ID"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#3FD8D4] hover:bg-[#2BB8B4] text-white font-semibold"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center text-sm text-gray-500">
            © 2025 BNI – Satu Atap Admin Dashboard
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
