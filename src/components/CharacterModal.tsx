
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCharacters } from '@/hooks/useCharacters';

interface Character {
  id: string;
  name: string;
  player_name: string;
  age: number;
  height: number;
  rpg_system: string;
  story: string;
  image_url?: string;
  user_id?: string;
  character_friendships?: Array<{
    id: string;
    friend_name: string;
    friendship_level: number;
  }>;
}

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onEdit?: () => void;
}

const CharacterModal = ({ character, isOpen, onClose, currentUserId, onEdit }: CharacterModalProps) => {
  const { profile } = useAuth();
  const { deleteCharacter } = useCharacters();

  if (!character) return null;

  const canEdit = currentUserId === character.user_id || profile?.role === 'admin';
  const canDelete = canEdit;

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o personagem "${character.name}"?`)) {
      await deleteCharacter(character.id);
      onClose();
    }
  };

  const friendships = character.character_friendships || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-primary">
              {character.name}
            </DialogTitle>
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {character.image_url ? (
              <img
                src={character.image_url}
                alt={character.name}
                className="w-full aspect-square object-cover rounded-lg border border-border"
              />
            ) : (
              <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-border flex items-center justify-center">
                <span className="text-8xl opacity-50">🎭</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Jogador:</span>
                <span className="text-foreground font-medium">{character.player_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Idade:</span>
                  <p className="text-foreground font-medium">{character.age} anos</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Altura:</span>
                  <p className="text-foreground font-medium">{character.height}m</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Sistema RPG:</span>
                <p className="text-accent font-medium uppercase tracking-wide">{character.rpg_system}</p>
              </div>

              {friendships.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Amizades:</span>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {friendships
                      .sort((a, b) => b.friendship_level - a.friendship_level)
                      .map((friendship, index) => (
                        <div key={index} className="flex justify-between items-center bg-muted/30 rounded p-2">
                          <span className="text-foreground">{friendship.friend_name}</span>
                          <span className="text-accent font-medium">Nível {friendship.friendship_level}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-primary mb-3">História do Personagem</h4>
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {character.story}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterModal;
