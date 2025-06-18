
import { Button } from '@/components/ui/button';
import { User, LogOut, Plus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="text-2xl font-bold dracula-gradient cursor-pointer float-animation"
            onClick={() => navigate('/')}
          >
            🎭 RPG Characters
          </div>
          <div className="text-white">Carregando...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          className="text-2xl font-bold dracula-gradient cursor-pointer float-animation"
          onClick={() => navigate('/')}
        >
          🎭 RPG Characters
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="outline"
                onClick={() => navigate('/create-character')}
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Personagem
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/my-characters')}
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Meus Personagens
              </Button>

              {profile?.role === 'admin' && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1 bg-card rounded-lg">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">
                  {profile?.username || user.email?.split('@')[0]}
                  {profile?.role === 'admin' && (
                    <span className="ml-1 text-xs text-orange-500">(Admin)</span>
                  )}
                </span>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Cadastrar
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
