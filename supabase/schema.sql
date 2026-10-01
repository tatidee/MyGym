-- MyGym · esquema de base de datos
-- Pegalo entero en Supabase → SQL Editor → New query → Run.
-- Cada fila queda atada a tu usuario y solo vos la podés leer o escribir (Row Level Security).

-- Un registro por día: agua, baño, peso, cintura, hombro, nota y comidas.
create table if not exists public.dias (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  fecha      date        not null,
  agua       integer     not null default 0,             -- mililitros
  banos      jsonb       not null default '[]'::jsonb,   -- [{ "h": "08:30", "t": 4 }]  t = escala de Bristol 1-7
  peso       numeric(5,1),                               -- kg en ayunas
  cintura    numeric(5,1),                               -- cm a la altura del ombligo
  hombro     smallint check (hombro between 0 and 10),   -- dolor del hombro izquierdo 0-10
  nota       text        not null default '',
  comidas    jsonb       not null default '{}'::jsonb,   -- { "desayuno": true, ... }
  updated_at timestamptz not null default now(),
  primary key (user_id, fecha)
);

-- Una fila por ejercicio por día, con todas sus series.
create table if not exists public.sesiones (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  fecha      date        not null,
  dia        text        not null,                       -- upper | lower | push | pull | legs
  ejercicio  text        not null,                       -- id del ejercicio en lib/plan.ts
  sets       jsonb       not null default '[]'::jsonb,   -- [{ "kg": 22.5, "reps": 10 }]
  created_at timestamptz not null default now(),
  unique (user_id, fecha, ejercicio)
);

create index if not exists sesiones_user_ejercicio_idx on public.sesiones (user_id, ejercicio, fecha desc);

alter table public.dias     enable row level security;
alter table public.sesiones enable row level security;

-- dias
drop policy if exists "dias_select_propio" on public.dias;
drop policy if exists "dias_insert_propio" on public.dias;
drop policy if exists "dias_update_propio" on public.dias;
drop policy if exists "dias_delete_propio" on public.dias;
create policy "dias_select_propio" on public.dias for select to authenticated using ((select auth.uid()) = user_id);
create policy "dias_insert_propio" on public.dias for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "dias_update_propio" on public.dias for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "dias_delete_propio" on public.dias for delete to authenticated using ((select auth.uid()) = user_id);

-- sesiones
drop policy if exists "sesiones_select_propio" on public.sesiones;
drop policy if exists "sesiones_insert_propio" on public.sesiones;
drop policy if exists "sesiones_update_propio" on public.sesiones;
drop policy if exists "sesiones_delete_propio" on public.sesiones;
create policy "sesiones_select_propio" on public.sesiones for select to authenticated using ((select auth.uid()) = user_id);
create policy "sesiones_insert_propio" on public.sesiones for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sesiones_update_propio" on public.sesiones for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "sesiones_delete_propio" on public.sesiones for delete to authenticated using ((select auth.uid()) = user_id);
