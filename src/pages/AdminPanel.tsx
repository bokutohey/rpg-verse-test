
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCharacters, Character } from '@/hooks/useCharacters';
import CharacterModal from '@/components/CharacterModal';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const { user, profile } = useAuth();
  const { characters, loading, deleteCharacter, fetchCharacters } = useCharacters();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Verificar se o usuário é admin
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="dracula-card max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar o painel administrativo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleViewCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setIsModalOpen(true);
  };

  const handleDeleteCharacter = async (character: Character) => {
    if (window.confirm(`Tem certeza que deseja excluir o personagem "${character.name}"?`)) {
      await deleteCharacter(character.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold dracula-gradient mb-4">
              🛡️ Painel Administrativo
            </h1>
            <p className="text-gray-300">
              Gerencie todos os personagens da plataforma
            </p>
          </div>

          <div className="grid gap-6">
            <Card className="dracula-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{characters.length}</div>
                    <div className="text-sm text-muted-foreground">Total de Personagens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">
                      {new Set(characters.map(c => c.rpg_system)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Sistemas RPG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">
                      {new Set(characters.map(c => c.user_id)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dracula-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">
                  Todos os Personagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {characters.map(character => (
                    <div key={character.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{character.name}</div>
                        <div className="text-sm text-muted-foreground">
                          por {character.player_name} • {character.rpg_system}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Criado em: {new Date(character.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCharacter(character)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCharacter(character)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {characters.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum personagem encontrado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CharacterModal
        character={selectedCharacter}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default AdminPanel;
