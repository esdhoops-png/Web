-- =====================================================================
-- ESTUDIO CREATIVO · creatividades editables, versiones, exportaciones e imágenes IA
-- =====================================================================

create table if not exists public.creatives (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  category text not null default 'carteles' check (category in
    ('carteles', 'futbol', 'stories', 'posts', 'carruseles', 'eventos', 'promociones', 'marca', 'video')),
  campaign text,
  format text not null default 'post',           -- post | story | square | landscape | custom | video
  width int not null default 1080 check (width between 64 and 8000),
  height int not null default 1350 check (height between 64 and 8000),
  pages int not null default 1 check (pages between 1 and 20),
  template_key text,                              -- plantilla de partida (integrada o de usuario)
  source_ref text,                                -- original del que es variante (p. ej. drive:<id>)
  is_template boolean not null default false,     -- guardado como plantilla reutilizable
  post_id uuid references public.posts (id) on delete set null,
  current_version int not null default 0,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists creatives_post on public.creatives (post_id);
create index if not exists creatives_updated on public.creatives (updated_at desc);

create table if not exists public.creative_versions (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references public.creatives (id) on delete cascade,
  version_no int not null,
  doc jsonb not null,                             -- documento editable por capas
  preview_path text,                              -- miniatura en Storage
  exports jsonb not null default '[]'::jsonb,     -- [{path, type, width, height, page}]
  note text,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (creative_id, version_no)
);

alter table public.attachments add column if not exists creative_version_id uuid references public.creative_versions (id) on delete set null;

create table if not exists public.ai_images (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  provider text not null,
  model text,
  storage_path text not null,
  width int, height int,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Versiones: número correlativo e inmutables
create or replace function private.creative_versions_before()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.creative_id::text));
  select coalesce(max(version_no), 0) + 1 into new.version_no from public.creative_versions where creative_id = new.creative_id;
  new.created_by := coalesce(new.created_by, auth.uid());
  return new;
end $$;
drop trigger if exists creative_versions_before on public.creative_versions;
create trigger creative_versions_before before insert on public.creative_versions
  for each row execute function private.creative_versions_before();

create or replace function private.creative_versions_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare c public.creatives; who text := coalesce(private.actor_name(auth.uid()), 'Alguien');
begin
  update public.creatives set current_version = new.version_no, updated_at = now() where id = new.creative_id returning * into c;
  perform private.log_activity('design', 'creative', c.id,
    who || ' ha guardado la versión ' || new.version_no || ' del diseño «' || c.title || '»', jsonb_build_object('version', new.version_no));
  return new;
end $$;
drop trigger if exists creative_versions_after on public.creative_versions;
create trigger creative_versions_after after insert on public.creative_versions
  for each row execute function private.creative_versions_after();

create or replace function private.creatives_touch()
returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists creatives_touch on public.creatives;
create trigger creatives_touch before update on public.creatives for each row execute function private.creatives_touch();

-- RLS
alter table public.creatives enable row level security;
alter table public.creative_versions enable row level security;
alter table public.ai_images enable row level security;

drop policy if exists "miembros ven creatividades" on public.creatives;
create policy "miembros ven creatividades" on public.creatives for select to authenticated using (public.is_member());
drop policy if exists "miembros crean creatividades" on public.creatives;
create policy "miembros crean creatividades" on public.creatives for insert to authenticated with check (public.is_member());
drop policy if exists "miembros editan creatividades" on public.creatives;
create policy "miembros editan creatividades" on public.creatives for update to authenticated using (public.is_member()) with check (public.is_member());
drop policy if exists "autor o admin borra creatividades" on public.creatives;
create policy "autor o admin borra creatividades" on public.creatives for delete to authenticated using (created_by = auth.uid() or public.is_admin());

drop policy if exists "miembros ven versiones de diseño" on public.creative_versions;
create policy "miembros ven versiones de diseño" on public.creative_versions for select to authenticated using (public.is_member());
drop policy if exists "miembros guardan versiones de diseño" on public.creative_versions;
create policy "miembros guardan versiones de diseño" on public.creative_versions for insert to authenticated with check (public.is_member());
-- (sin update: las versiones no se modifican; se crea una nueva)

drop policy if exists "miembros ven imágenes IA" on public.ai_images;
create policy "miembros ven imágenes IA" on public.ai_images for select to authenticated using (public.is_member());
-- (inserta solo la Edge Function ai-image con la service role)


do $$ begin
  begin alter publication supabase_realtime add table public.creatives; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.creative_versions; exception when duplicate_object then null; end;
end $$;

-- Nuevas categorías de la biblioteca para exportaciones del estudio
insert into public.library_categories (name, slug, icon, sort, created_by) values
  ('Estudio creativo', 'estudio', 'palette', 25, null),
  ('Imágenes IA', 'ia', 'sparkle', 26, null)
on conflict (slug) do nothing;
