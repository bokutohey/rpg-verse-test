
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implementar autenticação com Supabase
      console.log('Login attempt:', { email, password });
      
      // Simulação temporária
      toast({
        title: "Login realizado!",
        description: "Conecte ao Supabase para implementar autenticação real.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md dracula-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold dracula-gradient">
            🎭 Entrar
          </CardTitle>
          <CardDescription className="text-white">
            Acesse sua conta para gerenciar seus personagens
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dracula-input"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dracula-input"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full dracula-button"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-white">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se
              </button>
            </p>
            <button className="text-sm text-accent hover:underline">
              Esqueceu a senha?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
