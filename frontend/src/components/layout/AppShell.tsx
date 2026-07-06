import type { ReactNode } from 'react';
import { NavBar } from '@/components/layout/NavBar';
import { SkipToMain } from '@/components/ui/SkipToMain';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToMain />
      <NavBar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
