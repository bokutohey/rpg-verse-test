
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import CharacterCard from '@/components/CharacterCard';
import CharacterModal from '@/components/CharacterModal';
import Header from '@/components/Header';
import { useCharacters, Character } from '@/hooks/useCharacters';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { characters, loading } = useCharacters();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar personagens com base no termo de pesquisa
  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.rpg_system.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.player_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por sistema RPG
  const charactersByRPG = filteredCharacters.reduce((acc, character) => {
    if (!acc[character.rpg_system]) {
      acc[character.rpg_system] = [];
    }
    acc[character.rpg_system].push(character);
    return acc;
  }, {} as Record<string, Character[]>);

  // Ordenar personagens por nome dentro de cada grupo
  Object.keys(charactersByRPG).forEach(rpg => {
    charactersByRPG[rpg].sort((a, b) => a.name.localeCompare(b.name));
  });

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Carregando personagens...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center py-12">
            <div className="title-container">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 float-animation">
                🎭 Galeria de Personagens RPG
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Descubra histórias épicas e personagens únicos criados por nossa comunidade de RPG
            </p>

            {/* Busca */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar personagens ou sistemas RPG..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          {/* Lista de Personagens por RPG */}
          {Object.keys(charactersByRPG).length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-xl text-gray-300">
                {characters.length === 0 
                  ? "Nenhum personagem criado ainda. Seja o primeiro!" 
                  : "Nenhum personagem encontrado."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(charactersByRPG).map(([rpgSystem, rpgCharacters]) => (
                <section key={rpgSystem}>
                  <h2 className="text-2xl font-bold text-primary mb-6 pb-2 border-b border-gray-600">
                    📖 {rpgSystem}
                    <span className="text-sm text-gray-400 font-normal ml-2">
                      ({rpgCharacters.length} personagem{rpgCharacters.length !== 1 ? 's' : ''})
                    </span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rpgCharacters.map(character => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        onClick={() => handleCharacterClick(character)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalhes */}
      <CharacterModal
        character={selectedCharacter}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default Index;
