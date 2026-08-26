import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import OpportunityRadar from "./pages/OpportunityRadar";
import ChartIntelligence from "./pages/ChartIntelligence";
import PortfolioBrain from "./pages/PortfolioBrain";
import AIAssistant from "./pages/AIAssistant";
import AIVideoEngine from "./pages/AIVideoEngine";
import MarketNews from "./pages/MarketNews";
import SignalHistory from "./pages/SignalHistory";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

import { LanguageProvider } from "./contexts/LanguageContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/radar" element={<ProtectedRoute><OpportunityRadar /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><SignalHistory /></ProtectedRoute>} />
              <Route path="/charts" element={<ProtectedRoute><ChartIntelligence /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute><PortfolioBrain /></ProtectedRoute>} />
              <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
              <Route path="/video" element={<ProtectedRoute><AIVideoEngine /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><MarketNews /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              {/* Supabase Auth Redirect Handlers for HashRouter */}
              <Route path="/access_token*" element={<Navigate to="/" replace />} />
              <Route path="/error*" element={<Navigate to="/login" replace />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0e1a', color: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem', fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#e84040', marginBottom: '1rem' }}>⚠ App Error</h1>
          <pre style={{
            background: '#111', padding: '1rem', borderRadius: '8px',
            maxWidth: '800px', overflow: 'auto', fontSize: '12px',
            color: '#f87171', whiteSpace: 'pre-wrap'
          }}>
            {this.state.error.message}\n\n{this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem', padding: '0.5rem 1.5rem',
              background: '#e84040', color: '#fff', border: 'none',
              borderRadius: '6px', cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppWithBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithBoundary;
