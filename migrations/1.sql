-- 1.sql: esquema inicial de DevAdviento.
-- Perfiles de GitHub, tickets resueltos por lenguaje, pistas, envíos e insignias.
-- Las escrituras de puntuación solo las hace el servidor con la service role (ver CLAUDE.md).

-- Perfiles -------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  github_id bigint unique,
  username text not null,
  name text,
  avatar_url text,
  github_created_at timestamptz,
  created_at timestamptz not null default now()
);

comment on column public.profiles.github_created_at is
  'Fecha de creación de la cuenta de GitHub. Se usa para la antigüedad mínima de la clasificación.';

-- Crea el perfil al registrarse con GitHub.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, github_id, username, name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'provider_id', '')::bigint,
    coalesce(
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'preferred_username',
      'usuario'
    ),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tickets resueltos ----------------------------------------------------------

-- Una fila por usuario, día y lenguaje: la clave primaria hace que puntuar sea idempotente.
create table public.solves (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day smallint not null check (day between 1 and 24),
  language text not null check (language in ('js', 'ts', 'py')),
  stars numeric(2, 1) not null check (stars between 0 and 3),
  solved_at timestamptz not null default now(),
  primary key (user_id, day, language)
);

create index solves_language_idx on public.solves (language);

-- Pistas usadas: se registran antes de mostrarlas y restan 0,5 estrellas en ese día.
create table public.hint_uses (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day smallint not null check (day between 1 and 24),
  used_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Envíos: auditoría y límite de envíos por minuto.
-- run_id es único: cada ejecución firmada por el servidor solo se puede enviar una vez.
create table public.submissions (
  id bigint generated always as identity primary key,
  run_id uuid not null unique,
  user_id uuid not null references public.profiles (id) on delete cascade,
  day smallint not null check (day between 1 and 24),
  language text not null check (language in ('js', 'ts', 'py')),
  passed smallint not null,
  total smallint not null,
  created_at timestamptz not null default now()
);

create index submissions_user_created_idx on public.submissions (user_id, created_at desc);

-- Insignias ganadas (minijuegos y logros).
create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge)
);

-- Seguridad por filas -------------------------------------------------------
-- Sin políticas de escritura: solo el servidor (service role) escribe.

alter table public.profiles enable row level security;
alter table public.solves enable row level security;
alter table public.hint_uses enable row level security;
alter table public.submissions enable row level security;
alter table public.user_badges enable row level security;

create policy "Perfiles públicos" on public.profiles
  for select using (true);

create policy "Cada usuario ve sus tickets resueltos" on public.solves
  for select using ((select auth.uid()) = user_id);

create policy "Cada usuario ve sus pistas" on public.hint_uses
  for select using ((select auth.uid()) = user_id);

create policy "Cada usuario ve sus envíos" on public.submissions
  for select using ((select auth.uid()) = user_id);

create policy "Insignias públicas" on public.user_badges
  for select using (true);

-- Clasificación --------------------------------------------------------------
-- Vistas con los permisos del propietario: exponen solo agregados, nunca filas de solves.
-- El orden de desempate de lenguajes es el mismo que LANGUAGES en packages/shared.

create view public.language_leaderboard as
select
  p.id as user_id,
  p.username,
  p.name,
  p.avatar_url,
  p.github_created_at,
  s.language,
  sum(s.stars)::numeric(4, 1) as stars,
  count(*)::int as days
from public.solves s
join public.profiles p on p.id = s.user_id
group by p.id, s.language;

create view public.leaderboard as
with ranked as (
  select
    ll.*,
    row_number() over (
      partition by ll.user_id
      order by ll.stars desc, array_position(array['js', 'ts', 'py'], ll.language)
    ) as position
  from public.language_leaderboard ll
),
solved_days as (
  select user_id, count(distinct day)::int as days
  from public.solves
  group by user_id
)
select
  r.user_id,
  r.username,
  r.name,
  r.avatar_url,
  r.github_created_at,
  r.language, -- el mejor lenguaje del usuario
  r.stars,
  d.days
from ranked r
join solved_days d on d.user_id = r.user_id
where r.position = 1;

grant select on public.language_leaderboard to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
