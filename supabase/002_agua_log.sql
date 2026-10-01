-- MyGym · 002 · origen del agua
-- Correlo una sola vez en Supabase → SQL Editor → New query → Run (después de schema.sql).
-- Cada toma queda registrada con su fuente: [{ "ml": 250, "fuente": "Agua", "h": "08:30" },
--   { "ml": 300, "fuente": "Leche del desayuno", "h": "08:00", "auto": "desayuno" }]
-- La columna `agua` se mantiene y la app la guarda siempre como la suma de agua_log.
-- Las políticas RLS de `dias` ya cubren la columna nueva.

alter table public.dias add column if not exists agua_log jsonb not null default '[]'::jsonb;

-- Días que ya tenían agua cargada: pasan a una toma única, para que la suma coincida.
update public.dias
set agua_log = jsonb_build_array(jsonb_build_object('ml', agua, 'fuente', 'Agua', 'h', '—'))
where agua > 0 and agua_log = '[]'::jsonb;
