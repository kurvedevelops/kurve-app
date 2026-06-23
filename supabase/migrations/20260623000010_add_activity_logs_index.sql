-- Acelera queries de planilla filtradas por cliente, estado de borrador y fecha
CREATE INDEX IF NOT EXISTS idx_activity_logs_client_draft_date
  ON activity_logs (client_id, is_draft, log_date);
