import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppShell from '@/components/stream/AppShell';
// Add page imports here
import Home from '@/pages/Home';
import Streaming from '@/pages/Streaming';
import Categories from '@/pages/Categories';
import Sharing from '@/pages/Sharing';
import Me from '@/pages/Me';
import Search from '@/pages/Search';
import Title from '@/pages/Title';
import Player from '@/pages/Player';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/streaming" element={<Streaming />} />
        <Route path="/streaming/:providerId" element={<Streaming />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/sharing" element={<Sharing />} />
        <Route path="/me" element={<Me />} />
        <Route path="/search/:query" element={<Search />} />
        <Route path="/title/:mediaType/:id" element={<Title />} />
      </Route>
      <Route path="/player/:mediaType/:id/:season/:episode" element={<Player />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App