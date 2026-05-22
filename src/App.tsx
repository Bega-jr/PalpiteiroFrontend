import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import Palpites from "./pages/palpites/Palpites";
import Estatisticas from "./pages/estatisticas/Estatisticas";
import Resultados from "./pages/resultados/Resultados";
import Historico from "./pages/historico/Historico";
import Auth from "./pages/auth/Auth";
import NotFound from "./pages/errors/NotFound";

import EstatisticaDebug from "./pages/dev/EstatisticaDebug";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/debug-api" element={<EstatisticaDebug />} />
          <Route path="/resultados" element={<Resultados />} />

          {/* Privadas */}
          <Route
            path="/palpites"
            element={
              <ProtectedRoute>
                <Palpites />
              </ProtectedRoute>
            }
          />

          <Route
            path="/estatisticas"
            element={
              <ProtectedRoute>
                <Estatisticas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;