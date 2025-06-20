
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VoteStats {
  likes_count: number;
  dislikes_count: number;
  total_votes: number;
}

export interface UserVote {
  vote_type: 'like' | 'dislike';
}

export const useCharacterVoting = (characterId: string, userId?: string) => {
  const [voteStats, setVoteStats] = useState<VoteStats>({ likes_count: 0, dislikes_count: 0, total_votes: 0 });
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchVoteStats = async () => {
    try {
      const { data, error } = await supabase
        .from('character_vote_stats')
        .select('*')
        .eq('character_id', characterId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setVoteStats(data || { likes_count: 0, dislikes_count: 0, total_votes: 0 });
    } catch (error) {
      console.error('Error fetching vote stats:', error);
    }
  };

  const fetchUserVote = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('character_votes')
        .select('vote_type')
        .eq('character_id', characterId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && (data.vote_type === 'like' || data.vote_type === 'dislike')) {
        setUserVote({ vote_type: data.vote_type });
      } else {
        setUserVote(null);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const vote = async (voteType: 'like' | 'dislike') => {
    if (!userId) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para votar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Se o usuário já votou no mesmo tipo, remove o voto
      if (userVote?.vote_type === voteType) {
        const { error } = await supabase
          .from('character_votes')
          .delete()
          .eq('character_id', characterId)
          .eq('user_id', userId);

        if (error) throw error;
        setUserVote(null);
      } else {
        // Insere ou atualiza o voto
        const { error } = await supabase
          .from('character_votes')
          .upsert({
            character_id: characterId,
            user_id: userId,
            vote_type: voteType,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        setUserVote({ vote_type: voteType });
      }

      // Atualiza as estatísticas imediatamente
      await fetchVoteStats();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu voto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoteStats();
    fetchUserVote();

    // Configurar escuta em tempo real para mudanças nos votos com nome único
    const channelName = `character-votes-${characterId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'character_votes',
          filter: `character_id=eq.${characterId}`
        },
        (payload) => {
          console.log('Vote change detected:', payload);
          // Atualizar estatísticas quando houver mudanças nos votos
          fetchVoteStats();
          // Se o voto foi do usuário atual, atualizar também o voto do usuário
          if (userId && payload.new && (payload.new as any).user_id === userId) {
            fetchUserVote();
          } else if (userId && payload.old && (payload.old as any).user_id === userId) {
            fetchUserVote();
          }
        }
      )
      .subscribe();

    // Cleanup ao desmontar o componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, [characterId, userId]);

  return {
    voteStats,
    userVote,
    loading,
    vote
  };
};
