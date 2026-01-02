import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({ title: "Acesso negado", description: "Faça login para continuar.", variant: "destructive" });
      navigate("/auth");
    }
  }, [user, loading, navigate, toast]);

  // Enquanto carrega ou verifica login, evita renderizar a rota
  if (loading || !user) return null;

  return <>{children}</>;
}
