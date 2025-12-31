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

// Configuração de Retry para ajudar com instabilidades de rede
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, 
      refetchOnWindowFocus: false,
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
          <Route path="/" element={<Home />} />
          <Route path="/palpites" element={<Palpites />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
