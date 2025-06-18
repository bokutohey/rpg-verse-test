
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCharacters } from '@/hooks/useCharacters';
import { useNavigate } from 'react-router-dom';
import CharacterLikes from '@/components/CharacterLikes';

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
  const navigate = useNavigate();

  if (!character) return null;

  const canEdit = currentUserId === character.user_id || profile?.role === 'admin';
  const canDelete = canEdit;

  const handleEdit = () => {
    navigate(`/edit-character/${character.id}`);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o personagem "${character.name}"?`)) {
      await deleteCharacter(character.id);
      onClose();
    }
  };

  const friendships = character.character_friendships || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-sm border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              {character.name}
            </DialogTitle>
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
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
                className="w-full aspect-square object-cover rounded-lg border border-gray-600"
              />
            ) : (
              <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg border border-gray-600 flex items-center justify-center">
                <span className="text-8xl opacity-50">🎭</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Jogador:</span>
                <span className="text-white font-medium">{character.player_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Idade:</span>
                  <p className="text-white font-medium">{character.age} anos</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Altura:</span>
                  <p className="text-white font-medium">{character.height}m</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-400">Sistema RPG:</span>
                <p className="text-purple-400 font-medium uppercase tracking-wide">{character.rpg_system}</p>
              </div>

              {/* Seção de Likes */}
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-600">
                <CharacterLikes characterId={character.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Amizades - Full Width */}
        {friendships.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3">🤝 Amizades</h4>
            <div className="bg-gray-800/30 rounded-lg border border-gray-600">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-600">
                    <TableHead className="text-gray-300">Personagem</TableHead>
                    <TableHead className="text-gray-300">Nível</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {friendships
                    .sort((a, b) => b.friendship_level - a.friendship_level)
                    .map((friendship, index) => (
                      <TableRow key={index} className="border-gray-600">
                        <TableCell className="text-white">{friendship.friend_name}</TableCell>
                        <TableCell className="text-purple-400 font-medium">{friendship.friendship_level}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">História do Personagem</h4>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {character.story}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterModal;
