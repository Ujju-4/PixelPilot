import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '@/App';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CommandPaletteProvider } from '@/contexts/CommandPaletteContext';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CommandPaletteProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CommandPaletteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
