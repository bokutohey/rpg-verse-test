
import { Button } from '@/components/ui/button';
import { useCharacterVoting } from '@/hooks/useCharacterVoting';
import { cn } from '@/lib/utils';

interface VotingButtonsProps {
  characterId: string;
  userId?: string;
  className?: string;
}

const VotingButtons = ({ characterId, userId, className }: VotingButtonsProps) => {
  const { voteStats, userVote, loading, vote } = useCharacterVoting(characterId, userId);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          vote('like');
        }}
        disabled={loading}
        className={cn(
          "p-1 h-8 bg-black/30 hover:bg-green-600/20 border border-gray-600 text-white",
          userVote?.vote_type === 'like' && "bg-green-600/30 border-green-500"
        )}
      >
        <span className="text-lg">😊</span>
        <span className="ml-1 text-xs">{voteStats.likes_count}</span>
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          vote('dislike');
        }}
        disabled={loading}
        className={cn(
          "p-1 h-8 bg-black/30 hover:bg-red-600/20 border border-gray-600 text-white",
          userVote?.vote_type === 'dislike' && "bg-red-600/30 border-red-500"
        )}
      >
        <span className="text-lg">😢</span>
        <span className="ml-1 text-xs">{voteStats.dislikes_count}</span>
      </Button>
    </div>
  );
};

export default VotingButtons;
