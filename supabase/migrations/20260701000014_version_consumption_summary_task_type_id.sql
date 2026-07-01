-- Versiona la columna task_type_id que fue agregada directamente en el
-- dashboard de Supabase sin migración.
-- Usa IF NOT EXISTS / DO-EXCEPTION para ser idempotente:
-- si el entorno ya tiene la columna y la FK, no falla.

ALTER TABLE public.consumption_summary
  ADD COLUMN IF NOT EXISTS task_type_id uuid NULL;

DO $$
BEGIN
  ALTER TABLE public.consumption_summary
    ADD CONSTRAINT consumption_summary_task_type_id_fkey
    FOREIGN KEY (task_type_id)
    REFERENCES public.task_types(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
