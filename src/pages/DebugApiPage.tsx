import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '@/lib/api'; // Importa a instância do axios que você já usa

// Interface de tipo temporária para o teste
interface ConcursoTesteDebug {
  concurso: number;
  data: string;
  dezenas: number[];
}

const DebugApiPage = () => {
  const [dataAxios, setDataAxios] = useState<ConcursoTesteDebug[] | string>('Carregando via Axios...');
  const [dataFetch, setDataFetch] = useState<ConcursoTesteDebug[] | string>('Carregando via Fetch...');
  const [errorAxios, setErrorAxios] = useState<string | null>(null);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);

  const API_URL = (
    import.meta.env.VITE_API_URL ||
    "https://palpiteiro-backend.vercel.app"
  ).replace(/\/$/, "");


  // --- Método 1: Usando Axios (como seu app.ts faz) ---
  useEffect(() => {
    const fetchDataAxios = async () => {
      try {
        // Usa a instância 'api' que tem a baseURL configurada
        const response = await api.get<ConcursoTesteDebug[]>('/ultimos/10');
        setDataAxios(response.data); // Axios coloca a resposta em .data
        setErrorAxios(null);
      } catch (err: any) {
        console.error("Erro Axios:", err.response || err.message);
        setErrorAxios(err.message);
        setDataAxios("FALHA NO AXIOS! Verifique o console para mais detalhes.");
      }
    };
    fetchDataAxios();
  }, []);


  // --- Método 2: Usando o Fetch API nativo (para comparar) ---
  useEffect(() => {
    const fetchDataFetch = async () => {
      try {
        const response = await fetch(`${API_URL}/ultimos/10`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setDataFetch(data); 
        setErrorFetch(null);
      } catch (err: any) {
        console.error("Erro Fetch:", err.message);
        setErrorFetch(err.message);
        setDataFetch("FALHA NO FETCH! Verifique o console para mais detalhes.");
      }
    };
    fetchDataFetch();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Página de Debug de API (Teste Exclusivo)</h1>
      <p>Endpoints testados: <code>{API_URL}/ultimos/10</code></p>
      
      <hr />

      <h2>Resultado Axios:</h2>
      {errorAxios && <p style={{ color: 'red' }}>Erro: {errorAxios}</p>}
      <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        {typeof dataAxios === 'string' ? dataAxios : JSON.stringify(dataAxios, null, 2)}
      </pre>

      <hr />

      <h2>Resultado Fetch API Nativo:</h2>
      {errorFetch && <p style={{ color: 'red' }}>Erro: {errorFetch}</p>}
      <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        {typeof dataFetch === 'string' ? dataFetch : JSON.stringify(dataFetch, null, 2)}
      </pre>
    </div>
  );
};

export default DebugApiPage;
