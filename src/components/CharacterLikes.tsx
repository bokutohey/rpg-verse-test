
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CharacterLikesProps {
  characterId: string;
}

interface LikeInfo {
  username: string;
  vote_type: 'like' | 'dislike';
}

const CharacterLikes = ({ characterId }: CharacterLikesProps) => {
  const [likes, setLikes] = useState<LikeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('CharacterLikes component mounted with characterId:', characterId);
    
    const fetchLikes = async () => {
      try {
        console.log('=== STARTING fetchLikes ===');
        console.log('Character ID:', characterId);
        
        // Primeiro, buscar os votos de like para o personagem
        console.log('Fetching votes from character_votes table...');
        const { data: votes, error: votesError } = await supabase
          .from('character_votes')
          .select('user_id, vote_type')
          .eq('character_id', characterId)
          .eq('vote_type', 'like');

        console.log('Votes query result:', { votes, votesError });

        if (votesError) {
          console.error('Votes error:', votesError);
          throw votesError;
        }

        console.log('Number of votes found:', votes?.length || 0);

        if (!votes || votes.length === 0) {
          console.log('No votes found, setting empty likes array');
          setLikes([]);
          setLoading(false);
          return;
        }

        // Buscar os usernames dos usuários que curtiram
        const userIds = votes.map(vote => vote.user_id);
        console.log('User IDs that liked:', userIds);
        
        console.log('Fetching profiles from profiles table...');
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        console.log('Profiles query result:', { profiles, profilesError });

        if (profilesError) {
          console.error('Profiles error:', profilesError);
          throw profilesError;
        }

        console.log('Number of profiles found:', profiles?.length || 0);

        // Combinar os dados
        console.log('Combining votes and profiles data...');
        const likesData = votes.map(vote => {
          const profile = profiles?.find(p => p.id === vote.user_id);
          console.log(`Vote by user ${vote.user_id}:`, {
            vote,
            matchingProfile: profile,
            foundUsername: profile?.username
          });
          
          return {
            username: profile?.username || 'Usuário desconhecido',
            vote_type: vote.vote_type as 'like' | 'dislike'
          };
        });

        console.log('Final likes data to set:', likesData);
        console.log('=== ENDING fetchLikes ===');
        setLikes(likesData);
      } catch (error) {
        console.error('Error in fetchLikes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [characterId]);

  console.log('CharacterLikes render - current state:', { loading, likes });

  if (loading) {
    return <div className="text-sm text-gray-400">Carregando curtidas...</div>;
  }

  if (likes.length === 0) {
    return <div className="text-sm text-gray-400">Ninguém curtiu ainda.</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-300">💛 Curtidas:</h4>
      <div className="space-y-1">
        {likes.map((like, index) => (
          <div key={index} className="text-sm text-gray-400">
            <span className="text-yellow-400">{like.username}</span> curtiu este personagem
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterLikes;
