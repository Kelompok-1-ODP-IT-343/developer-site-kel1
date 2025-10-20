'use client';

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

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginBlueprint({ username: 'admin', password: 'admin' });
    if (result.success) {
      router.push('/dashboard');
    } else {
      console.error('Login gagal:', result.message);
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
              Login Admin Satu Atap
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              Demo dashboard access.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleDemoLogin} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@satuatap.my.id"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#3FD8D4] hover:bg-[#2BB8B4] text-white font-semibold"
              >
                Login
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
