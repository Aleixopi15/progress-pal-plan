
-- Primeiro, vamos corrigir a função de atualização de streak
-- O problema é que não há um constraint único no user_id na tabela study_streaks
ALTER TABLE public.study_streaks ADD CONSTRAINT study_streaks_user_id_unique UNIQUE (user_id);

-- Recriar a função de atualização de streak com melhor tratamento de conflitos
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

-- Criar tabela para notificações de metas
CREATE TABLE IF NOT EXISTS public.goal_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  notification_date DATE NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para goal_notifications
ALTER TABLE public.goal_notifications ENABLE ROW LEVEL SECURITY;

-- Policies para goal_notifications
CREATE POLICY "Users can view their own goal notifications" 
  ON public.goal_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal notifications" 
  ON public.goal_notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal notifications" 
  ON public.goal_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para criar notificações automáticas quando uma meta é criada
CREATE OR REPLACE FUNCTION create_goal_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a meta tem deadline, criar notificação para 1 dia antes
  IF NEW.deadline IS NOT NULL THEN
    INSERT INTO goal_notifications (user_id, goal_id, notification_date)
    VALUES (NEW.user_id, NEW.id, NEW.deadline - INTERVAL '1 day');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificações quando uma meta é inserida
CREATE TRIGGER create_notifications_on_goal_insert
  AFTER INSERT ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION create_goal_notifications();
