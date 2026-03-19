import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
