interface ConcursoCardProps {
  concurso: number;
  data: string;
  dezenas: number[];  // Sempre array de números (vamos montar no Home.tsx)
}

export function ConcursoCard({ concurso, data, dezenas }: ConcursoCardProps) {
  // Ordena as dezenas (por segurança, caso venham desordenadas)
  const sortedDezenas = [...dezenas].sort((a, b) => a - b);

  // Formata a data para pt-BR (ex: 29/12/2025)
  const dataFormatada = data
    ? new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <div className="border rounded-xl p-6 shadow-md bg-card hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h3 className="text-xl font-bold text-primary">
          Concurso {concurso}
        </h3>
        <span className="text-muted-foreground text-sm">
          {dataFormatada}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {sortedDezenas.length === 15 ? (
          sortedDezenas.map((num) => (
            <div
              key={num}
              className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm"
            >
              {String(num).padStart(2, "0")}
            </div>
          ))
        ) : (
          <span className="text-muted-foreground text-center col-span-full">
            Dezenas indisponíveis
          </span>
        )}
      </div>

      {/* Opcional: se quiser mostrar acumulado ou estimativa no futuro */}
      {/* <div className="mt-4 text-center text-sm text-muted-foreground">
        Acumulado para o próximo: R$ 6.000.000,00
      </div> */}
    </div>
  );
}
