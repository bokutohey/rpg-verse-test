
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FriendshipManager from '@/components/FriendshipManager';

const rpgSystems = [
  'Véu Quebrado',
  'Complicações em Arda',
  'Guerra Civil 2',
  'Vampiro: A Máscara',
  'Star Wars: Guerra dos Clones',
  'Kimetsu no Yaiba',
];

interface Friendship {
  friend_name: string;
  friendship_level: number;
}

const EditCharacter = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: '',
    playerName: '',
    age: '',
    height: '',
    rpgSystem: '',
    story: '',
    imageUrl: '',
  });
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (id) {
      loadCharacter();
    }
  }, [id]);

  const loadCharacter = async () => {
    try {
      const { data: character, error } = await supabase
        .from('characters')
        .select(`
          *,
          character_friendships (
            friend_name,
            friendship_level
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Verificar se o usuário pode editar
      if (character.user_id !== user?.id && profile?.role !== 'admin') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para editar este personagem.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setFormData({
        name: character.name,
        playerName: character.player_name,
        age: character.age.toString(),
        height: character.height.toString(),
        rpgSystem: character.rpg_system,
        story: character.story,
        imageUrl: character.image_url || '',
      });

      setFriendships(character.character_friendships || []);
    } catch (error) {
      console.error('Error loading character:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o personagem.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para editar um personagem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar personagem
      const { error: characterError } = await supabase
        .from('characters')
        .update({
          name: formData.name,
          player_name: formData.playerName,
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          rpg_system: formData.rpgSystem,
          story: formData.story,
          image_url: formData.imageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (characterError) throw characterError;

      // Remover amizades existentes e adicionar as novas
      await supabase
        .from('character_friendships')
        .delete()
        .eq('character_id', id);

      if (friendships.length > 0) {
        const friendshipData = friendships
          .filter(f => f.friend_name.trim())
          .map(friendship => ({
            character_id: id,
            friend_name: friendship.friend_name.trim(),
            friendship_level: friendship.friendship_level
          }));

        if (friendshipData.length > 0) {
          const { error: friendshipError } = await supabase
            .from('character_friendships')
            .insert(friendshipData);

          if (friendshipError) {
            console.error('Friendship error:', friendshipError);
          }
        }
      }

      toast({
        title: "Personagem atualizado!",
        description: "Seu personagem foi atualizado com sucesso.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error updating character:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o personagem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Carregando personagem...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="container mx-auto max-w-4xl">
        <Card className="dracula-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              ✏️ Editar Personagem
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL da Imagem */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem do Personagem</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="dracula-input"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Personagem *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="dracula-input"
                    placeholder="Ex: Aragorn"
                    required
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerName">Nome do Player *</Label>
                  <Input
                    id="playerName"
                    name="playerName"
                    value={formData.playerName}
                    onChange={handleChange}
                    className="dracula-input"
                    placeholder="Seu nome"
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Idade *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    className="dracula-input"
                    placeholder="Ex: 25"
                    required
                    min="1"
                    max="999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Altura (metros) *</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={handleChange}
                    className="dracula-input"
                    placeholder="Ex: 1.75"
                    required
                    min="0.5"
                    max="3.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rpgSystem">Sistema RPG *</Label>
                <select
                  id="rpgSystem"
                  name="rpgSystem"
                  value={formData.rpgSystem}
                  onChange={handleChange}
                  className="w-full dracula-input"
                  required
                >
                  <option value="">Selecione um sistema</option>
                  {rpgSystems.map(system => (
                    <option key={system} value={system}>{system}</option>
                  ))}
                </select>
              </div>

              <FriendshipManager
                friendships={friendships}
                onFriendshipsChange={setFriendships}
              />

              <div className="space-y-2">
                <Label htmlFor="story">História do Personagem *</Label>
                <Textarea
                  id="story"
                  name="story"
                  value={formData.story}
                  onChange={handleChange}
                  className="dracula-input min-h-[120px]"
                  placeholder="Conte a história do seu personagem..."
                  required
                  maxLength={1000}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.story.length}/1000 caracteres
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 border-muted text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCharacter;
