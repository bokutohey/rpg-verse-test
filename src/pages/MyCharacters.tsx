
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CharacterCard from '@/components/CharacterCard';
import CharacterModal from '@/components/CharacterModal';
import Header from '@/components/Header';
import { useCharacters, Character } from '@/hooks/useCharacters';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyCharacters = () => {
  const { characters, loading, fetchMyCharacters, deleteCharacter } = useCharacters();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMyCharacters(user.id);
    }
  }, [user?.id]);

  // Filtrar personagens com base no termo de pesquisa
  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.rpg_system.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por sistema RPG
  const charactersByRPG = filteredCharacters.reduce((acc, character) => {
    if (!acc[character.rpg_system]) {
      acc[character.rpg_system] = [];
    }
    acc[character.rpg_system].push(character);
    return acc;
  }, {} as Record<string, Character[]>);

  // Ordenar sistemas RPG alfabeticamente e personagens por nome dentro de cada grupo
  const sortedRPGSystems = Object.keys(charactersByRPG).sort();
  sortedRPGSystems.forEach(rpg => {
    charactersByRPG[rpg].sort((a, b) => a.name.localeCompare(b.name));
  });

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsModalOpen(true);
  };

  const handleEditCharacter = (character: Character, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-character/${character.id}`);
  };

  const handleDeleteCharacter = async (character: Character, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir o personagem "${character.name}"?`)) {
      await deleteCharacter(character.id);
      if (user?.id) {
        fetchMyCharacters(user.id);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Refresh da lista após fechar o modal
    if (user?.id) {
      fetchMyCharacters(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Carregando seus personagens...</div>
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
                👤 Meus Personagens
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Gerencie todos os seus personagens de RPG em um só lugar
            </p>

            {/* Busca */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar seus personagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          {/* Lista de Personagens por RPG */}
          {sortedRPGSystems.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎭</span>
              <p className="text-xl text-gray-300 mb-6">
                {characters.length === 0 
                  ? "Você ainda não criou nenhum personagem." 
                  : "Nenhum personagem encontrado."
                }
              </p>
              <Button
                onClick={() => navigate('/create-character')}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Criar Primeiro Personagem
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {sortedRPGSystems.map((rpgSystem) => (
                <section key={rpgSystem}>
                  <h2 className="text-2xl font-bold text-primary mb-6 pb-2 border-b border-gray-600">
                    📖 {rpgSystem}
                    <span className="text-sm text-gray-400 font-normal ml-2">
                      ({charactersByRPG[rpgSystem].length} personagem{charactersByRPG[rpgSystem].length !== 1 ? 's' : ''})
                    </span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {charactersByRPG[rpgSystem].map(character => (
                      <div key={character.id} className="relative group">
                        <CharacterCard
                          character={character}
                          onClick={() => handleCharacterClick(character)}
                        />
                        
                        {/* Botões de Ação */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleEditCharacter(character, e)}
                            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDeleteCharacter(character, e)}
                            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
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
        onClose={handleModalClose}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default MyCharacters;
