interface ConcursoCardProps {
  concurso: number;
  data: string;
  dezenas: number[];
}

export function ConcursoCard({ concurso, data, dezenas }: ConcursoCardProps) {
  const sortedDezenas = [...dezenas].sort((a, b) => a - b);

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
          <span className="text-muted-foreground">
            Dezenas indisponíveis
          </span>
        )}
      </div>
    </div>
  );
}
