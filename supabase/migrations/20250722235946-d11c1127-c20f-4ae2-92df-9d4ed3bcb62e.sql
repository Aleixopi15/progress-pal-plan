-- Atualizar a função de sequência de estudos para zerar quando quebrada
CREATE OR REPLACE FUNCTION public.update_study_streak()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Inserir ou atualizar a sequência do usuário
  INSERT INTO study_streaks (user_id, current_streak, longest_streak, last_study_date)
  VALUES (NEW.user_id, 1, 1, NEW.date)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE 
      -- Se estudou ontem, incrementa a sequência
      WHEN study_streaks.last_study_date = NEW.date - INTERVAL '1 day' THEN study_streaks.current_streak + 1
      -- Se estudou hoje (mesmo dia), mantém a sequência
      WHEN study_streaks.last_study_date = NEW.date THEN study_streaks.current_streak
      -- Se não estudou ontem, reseta a sequência para 1
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
$function$;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS trigger_update_study_streak ON study_sessions;
CREATE TRIGGER trigger_update_study_streak
    AFTER INSERT ON study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_study_streak();