export async function getUltimoConcurso() {
  const res = await fetch("https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil");
  if (!res.ok) throw new Error("Erro ao buscar último concurso da Caixa");

  const data = await res.json();

  // Mapeia para o formato esperado pelo Home.tsx
  const rateioMap: { [key: string]: { ganhadores: number; valor: number } } = {};
  data.listaRateioPremio.forEach((item: any) => {
    const faixa = item.faixa || item.descricaoFaixa.match(/\d+/)?.[0];
    if (faixa) {
      rateioMap[faixa] = {
        ganhadores: item.numeroDeGanhadores,
        valor: item.valorPremio,
      };
    }
  });

  return {
    concurso: data.numero,
    data: data.dataApuracao.split("/").reverse().join("-"), // "DD/MM/YYYY" → "YYYY-MM-DD" se precisar, ou mantenha como está
    data_concurso: data.dataApuracao, // para fallback
    dezenas: data.listaDezenas.map(Number).sort((a: number, b: number) => a - b),
    acumulado: data.acumulado,
    estimativa_proximo: data.valorEstimadoProximoConcurso,
    ganhadores_15: rateioMap["1"]?.ganhadores || rateioMap["15"]?.ganhadores || 0,
    valor_15: rateioMap["1"]?.valor || rateioMap["15"]?.valor || 0,
    ganhadores_14: rateioMap["2"]?.ganhadores || rateioMap["14"]?.ganhadores || 0,
    valor_14: rateioMap["2"]?.valor || rateioMap["14"]?.valor || 0,
    ganhadores_13: rateioMap["3"]?.ganhadores || rateioMap["13"]?.ganhadores || 0,
    valor_13: rateioMap["3"]?.valor || rateioMap["13"]?.valor || 0,
    ganhadores_12: rateioMap["4"]?.ganhadores || rateioMap["12"]?.ganhadores || 0,
    valor_12: rateioMap["4"]?.valor || rateioMap["12"]?.valor || 0,
    ganhadores_11: rateioMap["5"]?.ganhadores || rateioMap["11"]?.ganhadores || 0,
    valor_11: rateioMap["5"]?.valor || rateioMap["11"]?.valor || 0,
    listaMunicipioUFGanhadores: data.listaMunicipioUFGanhadores.map((item: any) => ({
      uf: item.uf,
      municipio: item.municipio,
      ganhadores: item.ganhadores,
    })),
    arrecadacao: data.valorArrecadado,
  };
}
