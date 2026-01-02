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
// Importe o componente de debug
import DebugApiPage from "./pages/DebugApiPage";

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
          {/* Adicione a rota de debug aqui */}
          <Route path="/debug-api" element={<DebugApiPage />} />

          {/* 
            [IMPORTANTE] A rota de Resultados provavelmente deveria ser pública. 
            Mova-a para cá se você não quiser exigir login para ver os resultados.
          */}
          {/* <Route path="/resultados" element={<Resultados />} /> */}


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
          <Route
            path="/resultados"
            element={
              <ProtectedRoute>
                <Resultados />
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

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

