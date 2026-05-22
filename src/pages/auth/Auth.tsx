import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Layout } from "@/components/layout/Layout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Clover,
  Mail,
  Lock,
  User,
  ArrowLeft,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { supabase } from "@/lib/supabase";

export default function Auth() {
  const [searchParams] = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "signup"
      ? "signup"
      : "login";

  const [activeTab, setActiveTab] =
    useState(initialMode);

  const { toast } = useToast();

  const { user, loading: authLoading } =
    useAuth();

  const [loading, setLoading] = useState(false);

  const [isRecoveryMode, setIsRecoveryMode] =
    useState(false);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotEmail, setForgotEmail] =
    useState("");

  // ======================================================
  // DETECTA RECUPERAÇÃO DE SENHA
  // ======================================================

  useEffect(() => {
    const hash = window.location.hash;

    if (
      hash.includes("access_token") &&
      hash.includes("type=recovery")
    ) {
      setIsRecoveryMode(true);

      toast({
        title: "Recuperação de senha",
        description:
          "Digite sua nova senha abaixo.",
      });
    }
  }, [toast]);

  // ======================================================
  // REDIRECIONAMENTO
  // ======================================================

  useEffect(() => {
    if (user && !isRecoveryMode) {
      window.location.href = "/historico";
    }
  }, [user, isRecoveryMode]);

  // ======================================================
  // LOGIN
  // ======================================================

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !loginForm.email ||
      !loginForm.password
    ) {
      toast({
        title: "Erro",
        description:
          "Preencha email e senha.",
        variant: "destructive",
      });

      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: loginForm.email.trim(),
          password: loginForm.password,
        });

      if (error) {
        toast({
          title: "Erro ao entrar",
          description:
            error.message.includes(
              "Invalid login credentials"
            )
              ? "Email ou senha incorretos."
              : error.message,
          variant: "destructive",
        });

        return;
      }

      window.location.href = "/historico";
    } catch (err: unknown) {
      toast({
        title: "Erro",
        description:
          err instanceof Error
            ? err.message
            : "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CADASTRO
  // ======================================================

  const handleSignup = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      signupForm.password !==
      signupForm.confirmPassword
    ) {
      toast({
        title: "Erro",
        description:
          "As senhas não coincidem.",
        variant: "destructive",
      });

      return;
    }

    if (
      !signupForm.email ||
      !signupForm.password ||
      !signupForm.name
    ) {
      toast({
        title: "Erro",
        description:
          "Preencha todos os campos.",
        variant: "destructive",
      });

      return;
    }

    setLoading(true);

    try {
      const redirectUrl =
        window.location.hostname ===
        "localhost"
          ? "http://localhost:3000/auth"
          : "https://palpiteiro-ia.netlify.app/auth";

      const { error } =
        await supabase.auth.signUp({
          email: signupForm.email.trim(),
          password: signupForm.password,

          options: {
            data: {
              name: signupForm.name.trim(),
            },

            emailRedirectTo: redirectUrl,
          },
        });

      if (error) {
        toast({
          title: "Erro ao cadastrar",
          description: error.message,
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Cadastro realizado!",
        description:
          "Verifique seu email para confirmar a conta.",
      });

      setActiveTab("login");

      setLoginForm({
        email: signupForm.email,
        password: "",
      });
    } catch (err: unknown) {
      toast({
        title: "Erro",
        description:
          err instanceof Error
            ? err.message
            : "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RESET PASSWORD EMAIL
  // ======================================================

  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast({
        title: "Erro",
        description: "Digite seu email.",
        variant: "destructive",
      });

      return;
    }

    setLoading(true);

    try {
      const redirectUrl =
        window.location.hostname ===
        "localhost"
          ? "http://localhost:3000/auth"
          : "https://palpiteiro-ia.netlify.app/auth";

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          forgotEmail.trim(),
          {
            redirectTo: redirectUrl,
          }
        );

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Email enviado!",
        description:
          "Verifique sua caixa de entrada.",
      });

      setForgotEmail("");
    } catch (err: unknown) {
      toast({
        title: "Erro",
        description:
          err instanceof Error
            ? err.message
            : "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ALTERAR SENHA
  // ======================================================

  const handleUpdatePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !newPassword ||
      !confirmNewPassword
    ) {
      toast({
        title: "Erro",
        description:
          "Preencha todos os campos.",
        variant: "destructive",
      });

      return;
    }

    if (
      newPassword !== confirmNewPassword
    ) {
      toast({
        title: "Erro",
        description:
          "As senhas não coincidem.",
        variant: "destructive",
      });

      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description:
          "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });

      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Senha alterada!",
        description:
          "Agora você já pode entrar normalmente.",
      });

      setIsRecoveryMode(false);

      window.location.hash = "";

      setNewPassword("");
      setConfirmNewPassword("");

      await supabase.auth.signOut();

      setActiveTab("login");
    } catch (err: unknown) {
      toast({
        title: "Erro",
        description:
          err instanceof Error
            ? err.message
            : "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RECOVERY SCREEN
  // ======================================================

  if (isRecoveryMode) {
    return (
      <Layout>
        <div className="container py-12 md:py-20">
          <div className="max-w-md mx-auto">

            <Card>
              <CardHeader className="text-center">

                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary-foreground" />
                </div>

                <CardTitle className="text-2xl">
                  Nova Senha
                </CardTitle>

              </CardHeader>

              <CardContent>

                <form
                  onSubmit={handleUpdatePassword}
                >

                  <div className="space-y-2">

                    <Label>
                      Nova senha
                    </Label>

                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      disabled={loading}
                    />

                  </div>

                  <div className="space-y-2 mt-4">

                    <Label>
                      Confirmar senha
                    </Label>

                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={
                        confirmNewPassword
                      }
                      onChange={(e) =>
                        setConfirmNewPassword(
                          e.target.value
                        )
                      }
                      disabled={loading}
                    />

                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={loading}
                  >
                    {loading
                      ? "Salvando..."
                      : "Alterar senha"}
                  </Button>

                </form>

              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // ======================================================
  // TELA NORMAL
  // ======================================================

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-md mx-auto">

          <Button
            asChild
            variant="ghost"
            className="mb-6"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>

          <Card>

            <CardHeader className="text-center">

              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clover className="h-8 w-8 text-primary-foreground" />
              </div>

              <CardTitle className="font-display text-2xl">
                Bem-vindo ao Palpiteiro
              </CardTitle>

            </CardHeader>

            <CardContent>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
              >

                <TabsList className="grid w-full grid-cols-2 mb-6">

                  <TabsTrigger value="login">
                    Entrar
                  </TabsTrigger>

                  <TabsTrigger value="signup">
                    Cadastrar
                  </TabsTrigger>

                </TabsList>

                <TabsContent value="login">

                  <form onSubmit={handleLogin}>

                    <div className="space-y-2">

                      <Label>Email</Label>

                      <div className="relative">

                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={loginForm.email}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              email:
                                e.target.value,
                            })
                          }
                        />

                      </div>
                    </div>

                    <div className="space-y-2 mt-4">

                      <Label>Senha</Label>

                      <div className="relative">

                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              password:
                                e.target.value,
                            })
                          }
                        />

                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-6"
                      disabled={
                        loading || authLoading
                      }
                    >
                      {loading
                        ? "Entrando..."
                        : "Entrar"}
                    </Button>

                  </form>

                  <form
                    onSubmit={
                      handleForgotPassword
                    }
                    className="mt-6"
                  >

                    <Label>
                      Esqueceu a senha?
                    </Label>

                    <div className="flex gap-2 mt-2">

                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={forgotEmail}
                        onChange={(e) =>
                          setForgotEmail(
                            e.target.value
                          )
                        }
                      />

                      <Button
                        type="submit"
                        variant="outline"
                        disabled={loading}
                      >
                        Enviar
                      </Button>

                    </div>

                  </form>

                </TabsContent>

                <TabsContent value="signup">

                  <form onSubmit={handleSignup}>

                    <div className="space-y-2">

                      <Label>Nome</Label>

                      <div className="relative">

                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input
                          type="text"
                          placeholder="Seu nome"
                          className="pl-10"
                          value={signupForm.name}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              name:
                                e.target.value,
                            })
                          }
                        />

                      </div>
                    </div>

                    <div className="space-y-2 mt-4">

                      <Label>Email</Label>

                      <div className="relative">

                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={signupForm.email}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              email:
                                e.target.value,
                            })
                          }
                        />

                      </div>
                    </div>

                    <div className="space-y-2 mt-4">

                      <Label>Senha</Label>

                      <div className="relative">

                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={signupForm.password}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              password:
                                e.target.value,
                            })
                          }
                        />

                      </div>
                    </div>

                    <div className="space-y-2 mt-4">

                      <Label>
                        Confirmar senha
                      </Label>

                      <div className="relative">

                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={
                            signupForm.confirmPassword
                          }
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              confirmPassword:
                                e.target.value,
                            })
                          }
                        />

                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-6"
                      disabled={loading}
                    >
                      {loading
                        ? "Criando conta..."
                        : "Criar Conta"}
                    </Button>

                  </form>

                </TabsContent>

              </Tabs>

              <p className="text-xs text-center text-muted-foreground mt-6">
                Ao continuar, você concorda
                com nossos Termos de Uso e
                Política de Privacidade.
              </p>

            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}