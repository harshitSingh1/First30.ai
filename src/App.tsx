import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { EmergencyRegionProvider } from "@/contexts/EmergencyRegionContext";
import Index from "./pages/Index";
import CitizenMode from "./pages/CitizenMode";
import EmergencyFlow from "./pages/EmergencyFlow";
import CPRMode from "./pages/CPRMode";
import EmergencySummary from "./pages/EmergencySummary";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import MapNearbyHelp from "./pages/MapNearbyHelp";
import VoiceAssistant from "./pages/VoiceAssistant";
import FirstAidKit from "./pages/FirstAidKit";
import About from "./pages/About";
import IntelligenceCenter from "./pages/IntelligenceCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AccessibilityProvider>
        <EmergencyRegionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/citizen" element={<CitizenMode />} />
                <Route path="/emergency/:category" element={<EmergencyFlow />} />
                <Route path="/cpr" element={<CPRMode />} />
                <Route path="/summary" element={<EmergencySummary />} />
                <Route path="/dispatcher" element={<DispatcherDashboard />} />
                <Route path="/map" element={<MapNearbyHelp />} />
                <Route path="/voice" element={<VoiceAssistant />} />
                <Route path="/first-aid-kit" element={<FirstAidKit />} />
                <Route path="/intelligence" element={<IntelligenceCenter />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </EmergencyRegionProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
