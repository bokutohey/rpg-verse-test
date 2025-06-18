
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, User } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  playerName: string;
  age: number;
  height: number;
  rpgSystem: string;
  friendship?: string;
  story: string;
  imageUrl?: string;
  userId?: string;
}

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onEdit?: () => void;
}

const CharacterModal = ({ character, isOpen, onClose, currentUserId, onEdit }: CharacterModalProps) => {
  if (!character) return null;

  const canEdit = currentUserId === character.userId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-primary">
              {character.name}
            </DialogTitle>
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
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {character.imageUrl ? (
              <img
                src={character.imageUrl}
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
                <span className="text-foreground font-medium">{character.playerName}</span>
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
                <p className="text-accent font-medium uppercase tracking-wide">{character.rpgSystem}</p>
              </div>

              {character.friendship && (
                <div>
                  <span className="text-sm text-muted-foreground">Amizades:</span>
                  <p className="text-foreground">{character.friendship}</p>
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
