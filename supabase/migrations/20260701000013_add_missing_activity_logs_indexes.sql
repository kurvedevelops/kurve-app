-- Índice para filtros de planilla por integrante (member_id).
-- El índice existente (client_id, is_draft, log_date) no cubre este caso
-- porque client_id no está en el filtro.
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_draft_date
  ON activity_logs (user_id, is_draft, log_date DESC);

-- Índice parcial para paginación sin filtro de cliente.
-- La planilla sin filtros usa WHERE is_draft = false ORDER BY log_date DESC LIMIT 50.
-- El índice (client_id, is_draft, log_date) no aplica sin client_id en el WHERE.
CREATE INDEX IF NOT EXISTS idx_activity_logs_not_draft_date
  ON activity_logs (log_date DESC)
  WHERE is_draft = false;
