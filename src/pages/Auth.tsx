import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clover, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(initialMode);
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar login real com Supabase
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O sistema de login será implementado em breve.",
    });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    // TODO: Implementar cadastro real com Supabase
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O sistema de cadastro será implementado em breve.",
    });
  };

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <Button asChild variant="ghost" className="mb-6">
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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={loginForm.email}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Entrar
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome"
                          className="pl-10"
                          value={signupForm.name}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={signupForm.email}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={signupForm.password}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={signupForm.confirmPassword}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Criar Conta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-xs text-center text-muted-foreground mt-6">
                Ao continuar, você concorda com nossos Termos de Uso e Política
                de Privacidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
