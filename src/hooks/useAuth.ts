import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: any | null;
  loading: boolean;
}

// Hook principal
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    // Função para buscar sessão atual
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setState({ user: data.session?.user ?? null, loading: false });
    };

    fetchSession();

    // Listener para mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ user: session?.user ?? null, loading: false });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Função para logout
  const logout = async () => {
    await supabase.auth.signOut();
    setState({ user: null, loading: false });
  };

  return {
    user: state.user,
    loading: state.loading,
    logout,
  };
}
