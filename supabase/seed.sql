-- ============================================================
-- SEED DE DATOS INICIALES — Sistema Kurve
-- ============================================================
-- Propósito: poblar la base de datos con configuración base
--            para un entorno de desarrollo o staging nuevo.
--
-- IMPORTANTE:
--   Los usuarios (admin, member, client) se crean desde
--   Supabase Auth, NO por SQL directo. Ver README.md para
--   instrucciones de creación de usuarios.
--
-- Cómo ejecutar:
--   Copiar y pegar este archivo completo en
--   Supabase Dashboard → SQL Editor → Run.
-- ============================================================


-- ============================================================
-- 1. TIPOS DE TAREA BASE
-- ============================================================

INSERT INTO public.task_types (id, name, counts_as_piece, allowed_roles, active)
VALUES
  (
    gen_random_uuid(),
    'Diseño',
    true,
    ARRAY['admin', 'member']::public.user_role[],
    true
  ),
  (
    gen_random_uuid(),
    'Redacción',
    true,
    ARRAY['admin', 'member']::public.user_role[],
    true
  ),
  (
    gen_random_uuid(),
    'Estrategia',
    false,
    ARRAY['admin', 'member']::public.user_role[],
    true
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- 2. SUBTAREAS BASE
-- ============================================================
-- Asociadas a "Diseño"

WITH tipo_diseno AS (
  SELECT id FROM public.task_types WHERE name = 'Diseño' LIMIT 1
)
INSERT INTO public.task_subtypes (task_type_id, name, active, display_order)
SELECT id, 'Feed', true, 1 FROM tipo_diseno
UNION ALL
SELECT id, 'Stories', true, 2 FROM tipo_diseno
UNION ALL
SELECT id, 'Reels', true, 3 FROM tipo_diseno
UNION ALL
SELECT id, 'Banner web', true, 4 FROM tipo_diseno
ON CONFLICT DO NOTHING;

-- Asociadas a "Redacción"

WITH tipo_redaccion AS (
  SELECT id FROM public.task_types WHERE name = 'Redacción' LIMIT 1
)
INSERT INTO public.task_subtypes (task_type_id, name, active, display_order)
SELECT id, 'Copy para post', true, 1 FROM tipo_redaccion
UNION ALL
SELECT id, 'Copy para anuncio', true, 2 FROM tipo_redaccion
UNION ALL
SELECT id, 'Guion para Reel', true, 3 FROM tipo_redaccion
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. CATEGORÍAS DE PIEZAS
-- ============================================================

INSERT INTO public.piece_categories (name, active)
VALUES
  ('Posts',   true),
  ('Stories', true),
  ('Reels',   true)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. CLIENTE DE EJEMPLO
-- ============================================================
-- Este cliente se crea solo si no existe ya uno con ese nombre.

INSERT INTO public.clients (id, name, status, start_date)
SELECT
  gen_random_uuid(),
  'Cliente Ejemplo',
  'active',
  CURRENT_DATE
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients WHERE name = 'Cliente Ejemplo'
);


-- ============================================================
-- 5. PAQUETE ACTIVO PARA EL CLIENTE DE EJEMPLO
-- ============================================================

WITH cliente AS (
  SELECT id FROM public.clients WHERE name = 'Cliente Ejemplo' LIMIT 1
),
posts_cat AS (
  SELECT id FROM public.piece_categories WHERE name = 'Posts' LIMIT 1
),
stories_cat AS (
  SELECT id FROM public.piece_categories WHERE name = 'Stories' LIMIT 1
),
reels_cat AS (
  SELECT id FROM public.piece_categories WHERE name = 'Reels' LIMIT 1
),
nuevo_paquete AS (
  INSERT INTO public.packages (
    client_id, name, status, start_date, end_date,
    total_hours, total_pieces, block_on_limit
  )
  SELECT
    cliente.id,
    'Paquete Mensual Ejemplo',
    'active',
    date_trunc('month', CURRENT_DATE)::date,
    (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date,
    80,
    30,
    false
  FROM cliente
  WHERE NOT EXISTS (
    SELECT 1 FROM public.packages
    WHERE client_id = cliente.id AND status = 'active'
  )
  RETURNING id
)
INSERT INTO public.package_pieces (package_id, category_id, quantity)
SELECT nuevo_paquete.id, posts_cat.id, 12 FROM nuevo_paquete, posts_cat
UNION ALL
SELECT nuevo_paquete.id, stories_cat.id, 12 FROM nuevo_paquete, stories_cat
UNION ALL
SELECT nuevo_paquete.id, reels_cat.id, 6 FROM nuevo_paquete, reels_cat;


-- ============================================================
-- FIN DEL SEED
--
-- Para verificar que se cargó correctamente:
--
-- SELECT name, counts_as_piece FROM public.task_types;
-- SELECT name FROM public.piece_categories;
-- SELECT c.name, p.name, p.total_hours FROM public.clients c
--   JOIN public.packages p ON p.client_id = c.id;
-- ============================================================
