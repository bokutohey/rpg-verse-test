
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Character {
  id: string;
  name: string;
  player_name: string;
  age: number;
  height: number;
  rpg_system: string;
  story: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  character_friendships?: Friendship[];
}

export interface Friendship {
  id: string;
  friend_name: string;
  friendship_level: number;
}

export const useCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select(`
          *,
          character_friendships (
            id,
            friend_name,
            friendship_level
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCharacters(data || []);
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os personagens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Personagem excluído com sucesso!",
      });

      await fetchCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o personagem.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  return {
    characters,
    loading,
    fetchCharacters,
    deleteCharacter
  };
};
