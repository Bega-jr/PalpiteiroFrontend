import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Palpites from "./pages/Palpites";
import Estatisticas from "./pages/Estatisticas";
import Resultados from "./pages/Resultados";
import Historico from "./pages/Historico";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DebugApiPage from "./pages/DebugApiPage"; // Importe o componente de debug

import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
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
          {/* Páginas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/debug-api" element={<DebugApiPage />} />
          {/* Rota de Resultados agora é pública para teste */}
          <Route path="/resultados" element={<Resultados />} />


          {/* Páginas privadas (requerem login) */}
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
          {/* A rota de resultados foi movida para cima, esta é ignorada */}
          {/* <Route
            path="/resultados"
            element={
              <ProtectedRoute>
                <Resultados />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

