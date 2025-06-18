
-- Primeiro, vamos verificar se há políticas RLS nas tabelas que podem estar bloqueando as consultas
-- Vamos adicionar políticas RLS para permitir leitura pública dos profiles (apenas username) e character_votes

-- Para a tabela profiles - permitir leitura pública dos usernames
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of usernames" ON public.profiles
  FOR SELECT USING (true);

-- Para a tabela character_votes - permitir leitura pública dos votos
ALTER TABLE public.character_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of votes" ON public.character_votes
  FOR SELECT USING (true);

-- Para permitir que usuários logados votem
CREATE POLICY "Allow authenticated users to insert votes" ON public.character_votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their votes" ON public.character_votes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their votes" ON public.character_votes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Vamos também verificar se todos os usuários que votaram têm perfis criados
-- Inserir perfis faltantes para usuários que votaram mas não têm perfil
INSERT INTO public.profiles (id, username)
SELECT DISTINCT cv.user_id, 'Usuário ' || SUBSTRING(cv.user_id::text, 1, 8)
FROM public.character_votes cv
LEFT JOIN public.profiles p ON cv.user_id = p.id
WHERE p.id IS NULL;
