import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import OpportunityRadar from "./pages/OpportunityRadar.tsx";
import ChartIntelligence from "./pages/ChartIntelligence.tsx";
import PortfolioBrain from "./pages/PortfolioBrain.tsx";
import AIAssistant from "./pages/AIAssistant.tsx";
import AIVideoEngine from "./pages/AIVideoEngine.tsx";
import MarketNews from "./pages/MarketNews.tsx";
import SignalHistory from "./pages/SignalHistory.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/radar" element={<OpportunityRadar />} />
          <Route path="/history" element={<SignalHistory />} />
          <Route path="/charts" element={<ChartIntelligence />} />
          <Route path="/portfolio" element={<PortfolioBrain />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/video" element={<AIVideoEngine />} />
          <Route path="/news" element={<MarketNews />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
