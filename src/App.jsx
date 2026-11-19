import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </ErrorBoundary>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
