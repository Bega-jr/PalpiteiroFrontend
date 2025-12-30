interface ConcursoCardProps {
  concurso: number;
  data: string;
  dezenas: number[] | string | null | undefined;
}

export function ConcursoCard({ concurso, data, dezenas }: ConcursoCardProps) {
  // 🔐 Normalização segura
  const dezenasArray: number[] = Array.isArray(dezenas)
    ? dezenas
    : typeof dezenas === "string"
    ? dezenas
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => !isNaN(n))
    : [];

  const sortedDezenas = [...dezenasArray].sort((a, b) => a - b);

  const dataFormatada = data
    ? new Date(data).toLocaleDateString("pt-BR")
    : "—";

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between mb-2">
        <strong>Concurso {concurso}</strong>
        <span>{dataFormatada}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedDezenas.length > 0 ? (
          sortedDezenas.map((num, i) => (
            <span
              key={i}
              className="bg-green-600 text-white px-2 py-1 rounded text-sm"
            >
              {String(num).padStart(2, "0")}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">
            Dezenas indisponíveis
          </span>
        )}
      </div>
    </div>
  );
}
