import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from './store/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { KeywordLab } from './pages/KeywordLab';
import { ContentStudio } from './pages/ContentStudio';
import { LinkedInPublisher } from './pages/LinkedInPublisher';
import { ContentLibrary } from './pages/ContentLibrary';
import { Calendar } from './pages/Calendar';
import { BrandSettings } from './pages/BrandSettings';
import { Connectors } from './pages/Connectors';
import { initAuth, googleSignIn } from './lib/firebase';
import { User } from 'firebase/auth';

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        onLogin();
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full space-y-8">
        <div className="space-y-3">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">DemandPilot</h1>
          <p className="text-base text-slate-500 font-medium">Turn keywords into content pipelines.</p>
        </div>

        <ul className="text-sm text-slate-600 text-left space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            Manual keyword lab
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            AI-assisted content drafts
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            LinkedIn publishing workflow
          </li>
        </ul>
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="gsi-material-button w-full relative h-[44px] px-4 bg-white text-[#3c4043] rounded-lg border border-[#dadce0] font-medium text-sm hover:bg-[#f8fafc] hover:shadow-sm transition-all overflow-hidden"
        >
          <div className="flex items-center justify-center w-full h-full gap-3">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-[18px] h-[18px]">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setUser(user);
        setNeedsAuth(false);
        setIsInitializing(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
        setIsInitializing(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (needsAuth) {
    return <LoginScreen onLogin={() => setNeedsAuth(false)} />;
  }

  return (
    <AppProvider>
      <Toaster position="top-right" className="toast-premium" toastOptions={{ className: 'toast-premium' }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="keywords" element={<KeywordLab />} />
            <Route path="studio" element={<ContentStudio />} />
            <Route path="publish" element={<LinkedInPublisher />} />
            <Route path="library" element={<ContentLibrary />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<BrandSettings />} />
            <Route path="connectors" element={<Connectors />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
