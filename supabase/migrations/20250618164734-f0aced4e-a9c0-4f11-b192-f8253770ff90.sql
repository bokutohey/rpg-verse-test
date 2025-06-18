
-- Criar tabela para armazenar os votos dos usuários nos personagens
CREATE TABLE public.character_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(character_id, user_id)
);

-- Ativar RLS para a tabela de votos
ALTER TABLE public.character_votes ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem ver todos os votos
CREATE POLICY "Authenticated users can view all votes" 
  ON public.character_votes 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para usuários autenticados poderem inserir seus próprios votos
CREATE POLICY "Authenticated users can insert their own votes" 
  ON public.character_votes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários poderem atualizar seus próprios votos
CREATE POLICY "Users can update their own votes" 
  ON public.character_votes 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para usuários poderem deletar seus próprios votos
CREATE POLICY "Users can delete their own votes" 
  ON public.character_votes 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar uma view para facilitar a consulta de estatísticas de votos
CREATE OR REPLACE VIEW public.character_vote_stats AS
SELECT 
  character_id,
  COUNT(CASE WHEN vote_type = 'like' THEN 1 END) as likes_count,
  COUNT(CASE WHEN vote_type = 'dislike' THEN 1 END) as dislikes_count,
  COUNT(*) as total_votes
FROM public.character_votes
GROUP BY character_id;
