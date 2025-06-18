
import { Card, CardContent } from '@/components/ui/card';

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
}

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

const CharacterCard = ({ character, onClick }: CharacterCardProps) => {
  const truncatedStory = character.story.length > 100 
    ? character.story.substring(0, 100) + '...' 
    : character.story;

  return (
    <Card 
      className="dracula-card cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden">
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <span className="text-6xl opacity-50">🎭</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-primary mb-1">{character.name}</h3>
            <p className="text-sm text-muted-foreground">por {character.playerName}</p>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-xs text-accent font-medium mb-2 uppercase tracking-wide">
            {character.rpgSystem}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {truncatedStory}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;
