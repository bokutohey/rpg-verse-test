
-- Remover políticas RLS existentes para characters
DROP POLICY IF EXISTS "Everyone can view characters" ON public.characters;
DROP POLICY IF EXISTS "Users can create their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can update their own characters or admins can update any" ON public.characters;
DROP POLICY IF EXISTS "Users can delete their own characters or admins can delete any" ON public.characters;

-- Remover políticas RLS existentes para character_friendships
DROP POLICY IF EXISTS "Everyone can view friendships" ON public.character_friendships;
DROP POLICY IF EXISTS "Users can manage friendships of their characters or admins can manage any" ON public.character_friendships;

-- Criar novas políticas RLS para characters
-- Todos podem visualizar personagens (incluindo usuários não autenticados)
CREATE POLICY "Anyone can view characters" 
  ON public.characters FOR SELECT 
  USING (true);

-- Usuários autenticados podem criar personagens
CREATE POLICY "Authenticated users can create characters" 
  ON public.characters FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Apenas o criador ou admin pode editar
CREATE POLICY "Users can update their own characters or admins can update any" 
  ON public.characters FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Apenas o criador ou admin pode excluir
CREATE POLICY "Users can delete their own characters or admins can delete any" 
  ON public.characters FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Criar novas políticas RLS para character_friendships
-- Todos podem visualizar amizades (incluindo usuários não autenticados)
CREATE POLICY "Anyone can view friendships" 
  ON public.character_friendships FOR SELECT 
  USING (true);

-- Apenas o criador do personagem ou admin pode gerenciar amizades
CREATE POLICY "Users can manage friendships of their characters or admins can manage any" 
  ON public.character_friendships FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.characters 
      WHERE id = character_id AND (user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );
