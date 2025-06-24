
-- Criar tabela para armazenar sequências de estudos
CREATE TABLE IF NOT EXISTS public.study_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

-- Policies para study_streaks
CREATE POLICY "Users can view their own streaks" 
  ON public.study_streaks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
  ON public.study_streaks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
  ON public.study_streaks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Criar tabela para metas dos usuários
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('subject', 'time', 'task')),
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  deadline DATE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Policies para user_goals
CREATE POLICY "Users can view their own goals" 
  ON public.user_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
  ON public.user_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
  ON public.user_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
  ON public.user_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para atualizar streak automaticamente
CREATE OR REPLACE FUNCTION update_study_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar a sequência do usuário
  INSERT INTO study_streaks (user_id, current_streak, longest_streak, last_study_date)
  VALUES (NEW.user_id, 1, 1, NEW.date)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE 
      WHEN study_streaks.last_study_date = NEW.date - INTERVAL '1 day' THEN study_streaks.current_streak + 1
      WHEN study_streaks.last_study_date = NEW.date THEN study_streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      study_streaks.longest_streak,
      CASE 
        WHEN study_streaks.last_study_date = NEW.date - INTERVAL '1 day' THEN study_streaks.current_streak + 1
        WHEN study_streaks.last_study_date = NEW.date THEN study_streaks.current_streak
        ELSE 1
      END
    ),
    last_study_date = NEW.date,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar streak quando uma sessão de estudo é inserida
CREATE TRIGGER update_streak_on_study_session
  AFTER INSERT ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_study_streak();
