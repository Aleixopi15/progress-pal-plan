
-- Adicionar coluna para marcar tópicos como concluídos
ALTER TABLE public.topics ADD COLUMN is_completed boolean NOT NULL DEFAULT false;

-- Adicionar coluna para data de conclusão
ALTER TABLE public.topics ADD COLUMN completed_at timestamp with time zone;
