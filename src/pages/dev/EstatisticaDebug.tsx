import { useQuery } from "@tanstack/react-query";

import { Layout } from "@/components/layout/Layout";

import EstatisticasService, {
  EstatisticaBase,
} from "@/services/api/estatisticas";

export default function EstatisticaDebug() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<EstatisticaBase[]>({
    queryKey: ["estatisticasBase"],
    queryFn: EstatisticasService.getBase,
    staleTime: 0,
  });

  return (
    <Layout>
      <div className="container py-12 space-y-4">
        <h1 className="text-2xl font-bold">
          Página de Depuração de Estatísticas
        </h1>

        {isLoading && (
          <div className="text-blue-500">
            Carregando dados...
          </div>
        )}

        {isError && (
          <div className="text-red-500">
            <h2 className="font-semibold">
              Erro Encontrado:
            </h2>

            <p>
              {error instanceof Error
                ? error.message
                : "Erro desconhecido"}
            </p>
          </div>
        )}

        {data && (
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
            <h2 className="font-semibold mb-2">
              Dados Recebidos
            </h2>

            <p className="font-mono text-sm mb-4">
              Tipo: {Array.isArray(data) ? "Array (Lista)" : typeof data}
            </p>

            <pre className="whitespace-pre-wrap break-all text-xs bg-white p-3 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  );
}