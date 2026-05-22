import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    type: '',
    text: ''
  });

  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage({
      type: '',
      text: ''
    });

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        navigate('/historico');

      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Cadastro realizado! Verifique seu e-mail.'
        });
      }

    } catch (error: unknown) {

      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : "Erro inesperado"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">
          {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>

        <p className="text-slate-500 mt-2">
          {isLogin
            ? 'Acesse seus palpites salvos'
            : 'Comece a salvar seus jogos hoje'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">

        <div className="relative">
          <Mail
            className="absolute left-3 top-3 text-slate-400"
            size={20}
          />

          <input
            type="email"
            placeholder="Seu e-mail"
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock
            className="absolute left-3 top-3 text-slate-400"
            size={20}
          />

          <input
            type="password"
            placeholder="Sua senha"
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              message.type === 'error'
                ? 'bg-red-50 text-red-600'
                : 'bg-green-50 text-green-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >

          {loading
            ? <Loader2 className="animate-spin" />
            : isLogin
              ? <LogIn size={20} />
              : <UserPlus size={20} />
          }

          {isLogin ? 'Entrar' : 'Cadastrar'}

        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          {isLogin
            ? 'Não tem uma conta? Cadastre-se'
            : 'Já tem uma conta? Faça login'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;