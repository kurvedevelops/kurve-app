-- Permite configurar si un paquete bloquea la carga de actividades al agotar horas
ALTER TABLE packages ADD COLUMN block_on_limit boolean NOT NULL DEFAULT false;
