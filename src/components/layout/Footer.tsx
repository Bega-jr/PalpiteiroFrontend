import { Link } from "react-router-dom";
import { Clover, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Clover className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Palpiteiro</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Palpites estatísticos inteligentes para a Lotofácil. Análises
              baseadas em dados históricos para aumentar suas chances.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold">Links Rápidos</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/palpites" className="hover:text-foreground transition-colors">
                Gerar Palpites
              </Link>
              <Link to="/estatisticas" className="hover:text-foreground transition-colors">
                Estatísticas
              </Link>
              <Link to="/resultados" className="hover:text-foreground transition-colors">
                Resultados Oficiais
              </Link>
              <Link to="/historico" className="hover:text-foreground transition-colors">
                Meu Histórico
              </Link>
            </nav>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold">Aviso Legal</h3>
            <p className="text-sm text-muted-foreground">
              Esta ferramenta é apenas para fins de entretenimento. Jogue com
              responsabilidade. Loterias são jogos de azar e não garantimos
              resultados.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 Palpiteiro. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="h-4 w-4 text-destructive fill-destructive" /> para a comunidade
          </p>
        </div>
      </div>
    </footer>
  );
}
