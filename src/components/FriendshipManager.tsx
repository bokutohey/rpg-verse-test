
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

interface Friendship {
  id?: string;
  friend_name: string;
  friendship_level: number;
}

interface FriendshipManagerProps {
  friendships: Friendship[];
  onFriendshipsChange: (friendships: Friendship[]) => void;
}

const FriendshipManager = ({ friendships, onFriendshipsChange }: FriendshipManagerProps) => {
  const [newFriend, setNewFriend] = useState({ friend_name: '', friendship_level: 1 });

  const addFriend = () => {
    if (newFriend.friend_name.trim()) {
      const updatedFriendships = [...friendships, { ...newFriend }];
      onFriendshipsChange(updatedFriendships);
      setNewFriend({ friend_name: '', friendship_level: 1 });
    }
  };

  const removeFriend = (index: number) => {
    const updatedFriendships = friendships.filter((_, i) => i !== index);
    onFriendshipsChange(updatedFriendships);
  };

  const updateFriend = (index: number, field: string, value: string | number) => {
    const updatedFriendships = friendships.map((friendship, i) => 
      i === index ? { ...friendship, [field]: value } : friendship
    );
    onFriendshipsChange(updatedFriendships);
  };

  return (
    <Card className="dracula-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          Amizades do Personagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de amizades existentes */}
        {friendships.map((friendship, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-7">
              <Input
                value={friendship.friend_name}
                onChange={(e) => updateFriend(index, 'friend_name', e.target.value)}
                placeholder="Nome do amigo"
                className="dracula-input"
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                min="0"
                max="10"
                value={friendship.friendship_level}
                onChange={(e) => updateFriend(index, 'friendship_level', parseInt(e.target.value))}
                className="dracula-input"
              />
            </div>
            <div className="col-span-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeFriend(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Adicionar nova amizade */}
        <div className="grid grid-cols-12 gap-2 items-end pt-4 border-t border-border">
          <div className="col-span-7">
            <Label>Nome do Amigo</Label>
            <Input
              value={newFriend.friend_name}
              onChange={(e) => setNewFriend({ ...newFriend, friend_name: e.target.value })}
              placeholder="Nome do amigo"
              className="dracula-input"
            />
          </div>
          <div className="col-span-3">
            <Label>Nível (0-10)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              value={newFriend.friendship_level}
              onChange={(e) => setNewFriend({ ...newFriend, friendship_level: parseInt(e.target.value) })}
              className="dracula-input"
            />
          </div>
          <div className="col-span-2">
            <Button
              type="button"
              onClick={addFriend}
              className="dracula-button w-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Nível de amizade: 0 = Desconhecido, 10 = Melhor amigo
        </p>
      </CardContent>
    </Card>
  );
};

export default FriendshipManager;
