
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import CharacterCard from '@/components/CharacterCard';
import CharacterModal from '@/components/CharacterModal';
import Header from '@/components/Header';

// Dados mock para demonstração
const mockCharacters = [
  {
    id: '1',
    name: 'Aragorn Dunedain',
    playerName: 'João Silva',
    age: 87,
    height: 1.85,
    rpgSystem: 'Véu Quebrado',
    friendship: 'Legolas, Gimli',
    story: 'Um ranger do Norte que descobriu ser o herdeiro perdido do trono de Gondor. Passou décadas protegendo o Condado e outras terras livres.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
    userId: 'user1'
  },
  {
    id: '2',
    name: 'Sakura Haruno',
    playerName: 'Maria Santos',
    age: 16,
    height: 1.61,
    rpgSystem: 'Kimetsu no Yaiba',
    friendship: 'Naruto, Sasuke',
    story: 'Uma ninja médica excepcional, conhecida por sua força sobre-humana e habilidades de cura. Treinou sob a tutela da Quinta Hokage.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616c6d1f3d4?w=300&h=300&fit=crop',
    userId: 'user2'
  },
  {
    id: '3',
    name: 'Darth Malak',
    playerName: 'Carlos Ferreira',
    age: 45,
    height: 1.92,
    rpgSystem: 'Star Wars: Guerra dos Clones',
    friendship: '',
    story: 'Outrora um Jedi promissor que caiu para o lado sombrio da Força. Agora serve como um temível Lorde Sith com uma mandíbula metálica.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    userId: 'user3'
  },
];

const Index = () => {
  const [characters] = useState(mockCharacters);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Filtrar personagens com base no termo de pesquisa
  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.rpgSystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.playerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por sistema RPG
  const charactersByRPG = filteredCharacters.reduce((acc, character) => {
    if (!acc[character.rpgSystem]) {
      acc[character.rpgSystem] = [];
    }
    acc[character.rpgSystem].push(character);
    return acc;
  }, {} as Record<string, typeof characters>);

  // Ordenar personagens por nome dentro de cada grupo
  Object.keys(charactersByRPG).forEach(rpg => {
    charactersByRPG[rpg].sort((a, b) => a.name.localeCompare(b.name));
  });

  const handleCharacterClick = (character: any) => {
    setSelectedCharacter(character);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Header 
        isAuthenticated={isAuthenticated}
        username={currentUser?.username}
        onLogout={handleLogout}
      />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center py-12">
            <div className="title-container">
              <h1 className="text-4xl md:text-6xl font-bold dracula-gradient mb-6 float-animation">
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
                Nenhum personagem encontrado.
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
        currentUserId={currentUser?.id}
      />
    </div>
  );
};

export default Index;
