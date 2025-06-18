
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
    const fetchLikes = async () => {
      try {
        const { data, error } = await supabase
          .from('character_votes')
          .select(`
            vote_type,
            profiles!inner (
              username
            )
          `)
          .eq('character_id', characterId)
          .eq('vote_type', 'like');

        if (error) throw error;

        const likesData = data?.map(vote => ({
          username: (vote.profiles as any).username,
          vote_type: vote.vote_type as 'like' | 'dislike'
        })) || [];

        setLikes(likesData);
      } catch (error) {
        console.error('Error fetching likes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [characterId]);

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
