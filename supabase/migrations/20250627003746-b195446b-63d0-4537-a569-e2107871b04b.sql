
-- Adicionar as colunas que estão faltando na tabela user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Atualizar registros existentes para garantir que is_active seja definido corretamente
UPDATE public.user_subscriptions 
SET is_active = CASE 
  WHEN subscription_status = 'active' THEN true 
  ELSE false 
END
WHERE is_active IS NULL;
