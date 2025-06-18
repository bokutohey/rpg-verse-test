
-- Criar bucket para imagens de personagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-images', 'character-images', true);

-- Política para permitir upload de imagens
CREATE POLICY "Anyone can upload character images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'character-images');

-- Política para permitir visualização de imagens
CREATE POLICY "Anyone can view character images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'character-images');

-- Política para permitir que usuários deletem suas próprias imagens ou admins deletem qualquer uma
CREATE POLICY "Users can delete their own images or admins can delete any" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'character-images' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid()))
  );
