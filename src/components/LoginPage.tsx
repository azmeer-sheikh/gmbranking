import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate brief processing delay
    await new Promise(r => setTimeout(r, 400));

    if (username === 'demo' && password === 'demo123') {
      onLogin(username, password);
    } else {
      setError('Invalid credentials. Use demo / demo123');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Card className="w-full max-w-md p-8 border-2 border-slate-200 shadow-xl bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="size-5 text-slate-600" />
          <h1 className="text-xl" style={{ fontWeight: 700, color: '#1e293b' }}>Secure Login</h1>
        </div>
        <p className="text-sm text-slate-600 mb-6">Use demo credentials to access the dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-600">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="demo"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo123"
              className="mt-1"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" style={{ backgroundColor: '#0052CC' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </Button>

          <div className="text-xs text-slate-500 text-center mt-4">
            Demo: <span className="font-semibold">demo</span> / <span className="font-semibold">demo123</span>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
