'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initiateLogin, verifyOtpLogin } from '@/services/auth';
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
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [savedIdentifier, setSavedIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!identifier || !password) {
      setError('Please enter both Developer ID and password');
      setLoading(false);
      return;
    }

    try {
      const res = await initiateLogin({ identifier, password });
      if (!res.success) {
        setError(res.message || 'Failed to login. Please check your credentials.');
        return;
      }
      if (res.requiresOtp) {
        setSavedIdentifier(identifier);
        setStep('otp');
        setOtp('');
      } else {
        // Logged in without OTP (fallback behavior)
        router.push('/dashboard');
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!savedIdentifier) {
      setError('Missing identifier. Please restart login.');
      setStep('credentials');
      return;
    }
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpLogin({ identifier: savedIdentifier, otp });
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.message || 'Invalid OTP.');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err?.response?.data?.message || 'Failed to verify OTP.');
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
              {step === 'credentials'
                ? 'Please enter your Developer ID and password to login.'
                : 'Enter the 6-digit OTP sent to your registered contact.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'credentials' ? (
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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3FD8D4] hover:bg-[#2BB8B4] text-white font-semibold"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">We sent an OTP to the contact registered for {savedIdentifier}.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    className="flex-1"
                    onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#3FD8D4] hover:bg-[#2BB8B4] text-white font-semibold"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="text-center text-sm text-gray-500">
            © 2025 BNI – Satu Atap Admin Dashboard
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
