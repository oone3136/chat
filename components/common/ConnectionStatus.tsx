'use client';

import { AlertCircle, CheckCircle, Radio } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isAuthenticated: boolean;
  currentUser: string;
  userCabang: string;
  userDivisi: string;
  onLogout: () => void;
}

export function ConnectionStatus({
  isConnected,
  isAuthenticated,
  currentUser,
  userCabang,
  userDivisi,
  onLogout,
}: ConnectionStatusProps) {
  return (
    <div className="bg-secondary border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-sm text-muted-foreground">Terhubung</span>
              </div>
              {isAuthenticated && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-foreground font-medium">{currentUser}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground text-xs">{userCabang}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground text-xs">{userDivisi}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">Terputus</span>
            </>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="px-3 py-1 text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive rounded transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
