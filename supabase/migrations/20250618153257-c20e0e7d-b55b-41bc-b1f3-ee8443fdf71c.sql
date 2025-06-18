
-- Criar tabela de personagens
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  player_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  height DECIMAL(3,2) NOT NULL,
  rpg_system TEXT NOT NULL,
  story TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Criar tabela de amizades/relacionamentos
CREATE TABLE public.character_friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  friend_name TEXT NOT NULL,
  friendship_level INTEGER NOT NULL CHECK (friendship_level >= 0 AND friendship_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Criar enum para roles de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Adicionar role à tabela profiles
ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'user' NOT NULL;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_friendships ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS para characters
CREATE POLICY "Everyone can view characters" 
  ON public.characters FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create their own characters" 
  ON public.characters FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters or admins can update any" 
  ON public.characters FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can delete their own characters or admins can delete any" 
  ON public.characters FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Políticas RLS para character_friendships
CREATE POLICY "Everyone can view friendships" 
  ON public.character_friendships FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can manage friendships of their characters or admins can manage any" 
  ON public.character_friendships FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.characters 
      WHERE id = character_id AND (user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

-- Definir usuário admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'papastatopolloss@gmail.com'
);

-- Se o usuário ainda não existe, vamos criar uma função que será executada quando ele se registrar
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o email for do admin, definir como admin
  IF NEW.email = 'papastatopolloss@gmail.com' THEN
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para definir admin automaticamente
CREATE TRIGGER set_admin_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user();
