
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import TrendingPage from "./pages/TrendingPage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import MangaDetailPage from "./pages/MangaDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle scroll restoration
const ScrollRestoration = () => {
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollRestoration />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search/anime" element={<SearchPage type="anime" />} />
          <Route path="/search/manga" element={<SearchPage type="manga" />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/manga/:id" element={<MangaDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
