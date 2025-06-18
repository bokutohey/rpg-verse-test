
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
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

const CreateCharacter = () => {
  const [formData, setFormData] = useState({
    name: '',
    playerName: '',
    age: '',
    height: '',
    rpgSystem: '',
    story: '',
    image: null as File | null,
  });
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 2MB.",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `characters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('character-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('character-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um personagem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;

      // Upload da imagem se existir
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      // Criar personagem
      const { data: character, error: characterError } = await supabase
        .from('characters')
        .insert({
          name: formData.name,
          player_name: formData.playerName,
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          rpg_system: formData.rpgSystem,
          story: formData.story,
          image_url: imageUrl,
          user_id: user.id
        })
        .select()
        .single();

      if (characterError) throw characterError;

      // Criar amizades
      if (friendships.length > 0) {
        const friendshipData = friendships
          .filter(f => f.friend_name.trim())
          .map(friendship => ({
            character_id: character.id,
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
        title: "Personagem criado!",
        description: "Seu personagem foi criado com sucesso.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating character:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o personagem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="container mx-auto max-w-4xl">
        <Card className="dracula-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold dracula-gradient text-center">
              🎭 Criar Novo Personagem
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload de Imagem */}
              <div className="space-y-2">
                <Label htmlFor="image">Imagem do Personagem</Label>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-sm text-center">
                        Clique para<br />adicionar imagem
                      </span>
                    )}
                  </div>
                  <Input
                    id="image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="dracula-input"
                  />
                </div>
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
                  className="flex-1 dracula-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando..." : "Criar Personagem"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCharacter;
