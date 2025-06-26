
-- Adicionar colunas para metas semanais e diárias na tabela user_settings
ALTER TABLE user_settings 
ADD COLUMN meta_horas_diarias INTEGER DEFAULT 6,
ADD COLUMN meta_questoes_diarias INTEGER DEFAULT 50,
ADD COLUMN meta_questoes_semanais INTEGER DEFAULT 350;

-- Criar tabela para tracking de metas diárias
CREATE TABLE daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_hours INTEGER NOT NULL DEFAULT 6,
  target_questions INTEGER NOT NULL DEFAULT 50,
  achieved_hours INTEGER DEFAULT 0,
  achieved_questions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Habilitar RLS na tabela daily_goals
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para daily_goals
CREATE POLICY "Users can view their own daily goals" 
  ON daily_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily goals" 
  ON daily_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals" 
  ON daily_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily goals" 
  ON daily_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);
