
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CharacterLikesProps {
  characterId: string;
}

interface VoteInfo {
  username: string;
  vote_type: 'like' | 'dislike';
}

const CharacterLikes = ({ characterId }: CharacterLikesProps) => {
  const [votes, setVotes] = useState<VoteInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        // Buscar todos os votos (likes e dislikes) para o personagem
        const { data: votesData, error: votesError } = await supabase
          .from('character_votes')
          .select('user_id, vote_type')
          .eq('character_id', characterId);

        if (votesError) {
          console.error('Votes error:', votesError);
          throw votesError;
        }

        if (!votesData || votesData.length === 0) {
          setVotes([]);
          setLoading(false);
          return;
        }

        // Buscar os usernames dos usuários que votaram
        const userIds = votesData.map(vote => vote.user_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) {
          console.error('Profiles error:', profilesError);
          throw profilesError;
        }

        // Combinar os dados
        const votesInfo = votesData.map(vote => {
          const profile = profiles?.find(p => p.id === vote.user_id);
          
          return {
            username: profile?.username || 'Usuário desconhecido',
            vote_type: vote.vote_type as 'like' | 'dislike'
          };
        });

        setVotes(votesInfo);
      } catch (error) {
        console.error('Error in fetchVotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [characterId]);

  if (loading) {
    return <div className="text-sm text-gray-400">Loading votes...</div>;
  }

  if (votes.length === 0) {
    return <div className="text-sm text-gray-400">No votes yet.</div>;
  }

  const likes = votes.filter(vote => vote.vote_type === 'like');
  const dislikes = votes.filter(vote => vote.vote_type === 'dislike');

  return (
    <div className="space-y-3">
      {likes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-2">😊 Likes:</h4>
          <div className="space-y-1">
            {likes.map((like, index) => (
              <div key={index} className="text-sm text-gray-400">
                <span className="text-green-400">{like.username}</span> liked
              </div>
            ))}
          </div>
        </div>
      )}

      {dislikes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-400 mb-2">😢 Dislikes:</h4>
          <div className="space-y-1">
            {dislikes.map((dislike, index) => (
              <div key={index} className="text-sm text-gray-400">
                <span className="text-red-400">{dislike.username}</span> disliked
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterLikes;
