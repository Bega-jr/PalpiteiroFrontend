import { useQuery } from "@tanstack/react-query";
import { getEstatisticasScore } from "@/lib/api";
import { Layout } from "@/components/Layout";

// Tipagem básica para o que esperamos receber
interface EstatisticasDiariasV2 {
  data_referencia: string;
  numeros_quentes: number[];
  numeros_frios: number[];
  numeros_atrasados: number[];
  media_sorteio: number;
  media_par_impar: number;
}

export default function EstatisticaDebug() {
  // Chamada para a API
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery<EstatisticasDiariasV2[]>({ // Esperamos um Array do Supabase
    queryKey: ["estatisticasBase"],
    queryFn: getEstatisticasScore,
    staleTime: 0, // Sem cache para ver sempre o dado fresco
  });

  return (
    <Layout>
      <div className="container py-12 space-y-4">
        <h1 className="text-2xl font-bold">Página de Depuração de Estatísticas</h1>

        {isLoading && (
          <div className="text-blue-500">Carregando dados do Supabase...</div>
        )}

        {isError && (
          <div className="text-red-500">
            <h2 className="font-semibold">Erro Encontrado:</h2>
            <p>{error instanceof Error ? error.message : "Erro desconhecido"}</p>
            <p className="mt-2">Provavelmente a API retornou um erro 404/500.</p>
          </div>
        )}

        {/* Aqui inspecionamos os dados */}
        {data && (
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
            <h2 className="font-semibold mb-2">Dados Recebidos (Formato):</h2>
            <p className="font-mono text-sm">
              Tipo: **{Array.isArray(data) ? 'Array (Lista)' : typeof data}**
            </p>

            <h2 className="font-semibold mt-4 mb-2">Conteúdo JSON Bruto:</h2>
            {/* O pre-wrap é crucial para ver a estrutura exata */}
            <pre className="whitespace-pre-wrap break-all text-xs bg-white p-3 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  );
}
