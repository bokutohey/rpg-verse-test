
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CharacterLikesProps {
  characterId: string;
}

interface VoteInfo {
  username: string;
  vote_type: 'like' | 'dislike';
}

interface Friendship {
  id: string;
  friend_name: string;
  friendship_level: number;
}

const CharacterLikes = ({ characterId }: CharacterLikesProps) => {
  const [votes, setVotes] = useState<VoteInfo[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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

        // Buscar as amizades do personagem
        const { data: friendshipsData, error: friendshipsError } = await supabase
          .from('character_friendships')
          .select('id, friend_name, friendship_level')
          .eq('character_id', characterId)
          .order('friendship_level', { ascending: false });

        if (friendshipsError) {
          console.error('Friendships error:', friendshipsError);
          throw friendshipsError;
        }

        setFriendships(friendshipsData || []);

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
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [characterId]);

  if (loading) {
    return <div className="text-sm text-gray-400">Loading votes...</div>;
  }

  const likes = votes.filter(vote => vote.vote_type === 'like');
  const dislikes = votes.filter(vote => vote.vote_type === 'dislike');

  return (
    <div className="space-y-4">
      {/* Tabela de Amizades */}
      {friendships.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-purple-400 mb-3">🤝 Amizades:</h4>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-gray-300">Personagem</TableHead>
                <TableHead className="text-gray-300">Nível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {friendships.map((friendship) => (
                <TableRow key={friendship.id} className="border-gray-600">
                  <TableCell className="text-white">{friendship.friend_name}</TableCell>
                  <TableCell className="text-purple-400 font-medium">{friendship.friendship_level}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Likes e Dislikes */}
      {(likes.length > 0 || dislikes.length > 0) && (
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
      )}

      {votes.length === 0 && friendships.length === 0 && (
        <div className="text-sm text-gray-400">No votes or friendships yet.</div>
      )}
    </div>
  );
};

export default CharacterLikes;
