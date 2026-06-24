'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AuthBoxProps {
  onRegister: (username: string, password: string, cabang: string, divisi: string) => void;
  onLogin: (action: string, username: string, password: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function AuthBox({ onRegister, onLogin, isLoading, error }: AuthBoxProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cabang, setCabang] = useState('');
  const [divisi, setDivisi] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin("LOGIN",username, password);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password && cabang && divisi) {
      onRegister(username, password, cabang, divisi);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {mode === 'login' ? 'Masuk' : 'Daftar'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'login'
              ? 'Masuk ke akun Anda untuk melanjutkan'
              : 'Buat akun baru untuk bergabung'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Anda"
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cabang
                </label>
                <input
                  type="text"
                  value={cabang}
                  onChange={(e) => setCabang(e.target.value)}
                  placeholder="Nama cabang Anda"
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Divisi
                </label>
                <input
                  type="text"
                  value={divisi}
                  onChange={(e) => setDivisi(e.target.value)}
                  placeholder="Nama divisi Anda"
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </Button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Belum memiliki akun?' : 'Sudah memiliki akun?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary hover:underline font-semibold"
              disabled={isLoading}
            >
              {mode === 'login' ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
