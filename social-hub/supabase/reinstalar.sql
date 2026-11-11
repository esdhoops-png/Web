-- 5 MENTARIOS SOCIAL HUB · REINSTALAR (borra lo instalado por un intento anterior y lo vuelve a crear)
-- Pega TODO este archivo en Supabase → SQL Editor → Run. Los usuarios de Authentication no se borran.

-- Borra todo lo que crea setup.sql (para reinstalar desde cero). No toca usuarios de Auth.
do $$ begin
  if to_regclass('cron.job') is not null and exists (select 1 from cron.job where jobname = 'social-hub-deadlines') then
    perform cron.unschedule('social-hub-deadlines');
  end if;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
drop policy if exists "miembros leen ficheros hub" on storage.objects;
drop policy if exists "miembros suben ficheros hub" on storage.objects;
drop policy if exists "autor borra ficheros hub" on storage.objects;
drop table if exists public.ai_images, public.creative_versions, public.creatives, public.activity_log, public.push_subscriptions, public.notification_prefs, public.notifications,
  public.attachments, public.chat_reads, public.chat_messages, public.comments, public.tasks, public.post_history,
  public.approvals, public.post_versions, public.posts, public.library_items, public.library_categories,
  public.app_settings, public.profiles cascade;
drop function if exists public.is_member() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.can_approve() cascade;
drop function if exists public.decide_approval(uuid, public.approval_decision, text) cascade;
drop function if exists public.duplicate_post(uuid, timestamptz) cascade;
drop function if exists public.run_deadline_reminders_for_tests() cascade;
drop schema if exists private cascade;
drop type if exists public.user_role, public.post_status, public.post_kind, public.task_status, public.task_priority,
  public.approval_decision, public.file_source cascade;


-- ===== supabase/migrations/20261111000001_core.sql =====
-- =====================================================================
-- 5 MENTARIOS SOCIAL HUB · Esquema principal
-- Usuarios, roles, publicaciones/calendario, versiones, aprobaciones,
-- tareas, comentarios, chat, biblioteca, adjuntos, notificaciones,
-- actividad e historial. Todo protegido con Row Level Security.
-- =====================================================================

create extension if not exists pg_net;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.user_role as enum ('marketing', 'owner', 'collaborator');
create type public.post_status as enum (
  'idea', 'pending_prep', 'in_design', 'in_review',
  'pending_approval', 'approved', 'scheduled', 'published'
);
create type public.post_kind as enum (
  'post', 'reel', 'story', 'carousel', 'weekly_poster', 'champions',
  'event', 'promo', 'sports', 'special_date', 'marketing_task', 'meeting', 'reminder'
);
create type public.task_status as enum ('pending', 'in_progress', 'in_review', 'done');
create type public.task_priority as enum ('urgent', 'high', 'medium', 'low');
create type public.approval_decision as enum ('requested', 'approved', 'changes_requested');
create type public.file_source as enum ('drive', 'storage', 'link');

-- ---------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  role public.user_role not null default 'collaborator',
  is_admin boolean not null default false,
  can_approve boolean not null default false,
  color text not null default '#34C26B',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active and is_admin);
$$;

create or replace function public.can_approve()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active and can_approve);
$$;

-- Crea el perfil al crear el usuario en Auth. El primer usuario es admin.
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  first_user boolean := not exists (select 1 from public.profiles);
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r public.user_role := coalesce(nullif(meta->>'role', '')::public.user_role,
                                 case when first_user then 'marketing'::public.user_role else 'collaborator'::public.user_role end);
begin
  insert into public.profiles (id, email, full_name, role, is_admin, can_approve, color)
  values (
    new.id, new.email,
    coalesce(nullif(meta->>'full_name', ''), split_part(new.email, '@', 1)),
    r,
    first_user,
    r = 'owner',
    case r when 'owner' then '#F2A541' when 'marketing' then '#34C26B' else '#7FB3FF' end
  );
  insert into public.notification_prefs (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Ajustes compartidos (ID de carpeta de Drive, etc.)
-- ---------------------------------------------------------------------
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Secretos para el envío push (no expuesto por la API: esquema private)
create table private.settings (
  key text primary key,
  value text not null
);
alter table private.settings enable row level security; -- sin políticas: solo accesible desde funciones internas

-- ---------------------------------------------------------------------
-- Biblioteca
-- ---------------------------------------------------------------------
create table public.library_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 60),
  slug text not null unique,
  icon text not null default 'folder',
  sort int not null default 100,
  drive_folder_id text,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.library_categories (id) on delete set null,
  source public.file_source not null,
  drive_file_id text,
  storage_path text,
  name text not null,
  mime_type text,
  web_url text,
  thumbnail_url text,
  size_bytes bigint,
  notes text,
  tags text[] not null default '{}',
  added_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint library_item_has_ref check (drive_file_id is not null or storage_path is not null or web_url is not null)
);
alter table public.library_items add constraint library_items_drive_cat unique (drive_file_id, category_id);

-- ---------------------------------------------------------------------
-- Publicaciones / elementos del calendario
-- ---------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  kind public.post_kind not null default 'post',
  title text not null check (length(trim(title)) between 1 and 200),
  description text,
  starts_at timestamptz,
  all_day boolean not null default false,
  ends_at timestamptz,
  deadline date,
  platforms text[] not null default '{instagram}',
  format text,
  objective text,
  copy text,
  hashtags text,
  cta text,
  material text,
  status public.post_status not null default 'idea',
  is_draft boolean not null default false,
  requires_approval boolean not null default true,
  assignee_id uuid references public.profiles (id) on delete set null,
  category_id uuid references public.library_categories (id) on delete set null,
  pending_info text,
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  published_by uuid references public.profiles (id) on delete set null,
  published_url text,
  import_key text unique,
  duplicated_from uuid references public.posts (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_starts_at on public.posts (starts_at);
create index posts_status on public.posts (status);

create table public.post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  version_no int not null,
  note text,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (post_id, version_no)
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  version_id uuid references public.post_versions (id) on delete set null,
  decision public.approval_decision not null,
  comment text,
  decided_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index approvals_post on public.approvals (post_id, created_at);

create table public.post_history (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts (id) on delete cascade,
  field text not null,
  old_value text,
  new_value text,
  changed_by uuid references public.profiles (id) on delete set null,
  changed_at timestamptz not null default now()
);
create index post_history_post on public.post_history (post_id, changed_at);

-- ---------------------------------------------------------------------
-- Tareas
-- ---------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  description text,
  assignee_id uuid references public.profiles (id) on delete set null,
  due_date date,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'pending',
  post_id uuid references public.posts (id) on delete set null,
  position double precision not null default extract(epoch from now()),
  completed_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_due on public.tasks (due_date);

-- ---------------------------------------------------------------------
-- Comentarios (en publicaciones y tareas)
-- ---------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 5000),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  constraint comment_target check ((post_id is not null)::int + (task_id is not null)::int = 1)
);
create index comments_post on public.comments (post_id, created_at);
create index comments_task on public.comments (task_id, created_at);

-- ---------------------------------------------------------------------
-- Chat interno
-- ---------------------------------------------------------------------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'general',
  body text not null default '' check (length(body) <= 5000),
  reply_to_id uuid references public.chat_messages (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index chat_messages_channel on public.chat_messages (channel, created_at);

create table public.chat_reads (
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel text not null default 'general',
  last_read_at timestamptz not null default now(),
  primary key (user_id, channel)
);

-- ---------------------------------------------------------------------
-- Adjuntos (referencias a Drive, ficheros en Storage o enlaces)
-- ---------------------------------------------------------------------
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete cascade,
  version_id uuid references public.post_versions (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  message_id uuid references public.chat_messages (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  library_item_id uuid references public.library_items (id) on delete set null,
  role text not null default 'file' check (role in ('design', 'photo', 'video', 'file', 'link')),
  source public.file_source not null,
  drive_file_id text,
  storage_path text,
  name text not null,
  mime_type text,
  web_url text,
  thumbnail_url text,
  size_bytes bigint,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint attachment_has_ref check (drive_file_id is not null or storage_path is not null or web_url is not null),
  constraint attachment_has_target check (
    post_id is not null or version_id is not null or task_id is not null or message_id is not null or comment_id is not null)
);
create index attachments_post on public.attachments (post_id);
create index attachments_version on public.attachments (version_id);
create index attachments_task on public.attachments (task_id);
create index attachments_message on public.attachments (message_id);

-- ---------------------------------------------------------------------
-- Notificaciones
-- ---------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  actor_id uuid references public.profiles (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user on public.notifications (user_id, created_at desc);

create table public.notification_prefs (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  push_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Actividad
-- ---------------------------------------------------------------------
create table public.activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text not null,
  details jsonb,
  created_at timestamptz not null default now()
);
create index activity_created on public.activity_log (created_at desc);

-- Trigger de perfiles (después de crear notification_prefs)
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- =====================================================================
-- Funciones auxiliares
-- =====================================================================
create or replace function private.actor_name(uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(nullif(full_name, ''), email, 'Alguien') from public.profiles where id = uid;
$$;

create or replace function private.log_activity(
  p_action text, p_entity_type text, p_entity_id uuid, p_summary text, p_details jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, summary, details)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_summary, p_details);
end $$;

-- Crea una notificación respetando las preferencias del destinatario.
create or replace function private.notify(
  p_user uuid, p_type text, p_title text, p_body text, p_link text)
returns void language plpgsql security definer set search_path = public as $$
declare
  enabled boolean;
begin
  if p_user is null or p_user = auth.uid() then return; end if;
  if not exists (select 1 from public.profiles where id = p_user and active) then return; end if;
  select coalesce((prefs ->> p_type)::boolean, true) into enabled
    from public.notification_prefs where user_id = p_user;
  if enabled is false then return; end if;
  insert into public.notifications (user_id, type, title, body, link, actor_id)
  values (p_user, p_type, p_title, left(p_body, 300), p_link, auth.uid());
end $$;

-- Notifica a todos los miembros activos excepto quien hace la acción.
create or replace function private.notify_all(p_type text, p_title text, p_body text, p_link text)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select id from public.profiles where active and id is distinct from auth.uid() loop
    perform private.notify(r.id, p_type, p_title, p_body, p_link);
  end loop;
end $$;

create or replace function private.kind_label(k public.post_kind)
returns text language sql immutable as $$
  select case k
    when 'post' then 'Publicación' when 'reel' then 'Reel' when 'story' then 'Story'
    when 'carousel' then 'Carrusel' when 'weekly_poster' then 'Cartel semanal'
    when 'champions' then 'Champions League' when 'event' then 'Evento' when 'promo' then 'Promoción'
    when 'sports' then 'Actividad deportiva' when 'special_date' then 'Fecha especial'
    when 'marketing_task' then 'Tarea de marketing' when 'meeting' then 'Reunión' when 'reminder' then 'Recordatorio'
  end;
$$;

create or replace function private.status_label(s public.post_status)
returns text language sql immutable as $$
  select case s
    when 'idea' then 'Idea' when 'pending_prep' then 'Pendiente de preparar' when 'in_design' then 'En diseño'
    when 'in_review' then 'En revisión' when 'pending_approval' then 'Pendiente de aprobación'
    when 'approved' then 'Aprobado' when 'scheduled' then 'Programado' when 'published' then 'Publicado'
  end;
$$;

create or replace function private.fmt_ts(t timestamptz)
returns text language sql stable as $$
  select case when t is null then 'sin fecha'
    else to_char(t at time zone 'Atlantic/Canary', 'DD/MM/YYYY HH24:MI') end;
$$;

-- =====================================================================
-- Triggers: publicaciones
-- =====================================================================
create or replace function private.posts_before()
returns trigger language plpgsql security definer set search_path = public as $$
declare via_rpc boolean := coalesce(current_setting('app.via_rpc', true), '') = '1';
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    if new.created_by is null then new.created_by := auth.uid(); end if;
    -- Una publicación no puede nacer aprobada, programada ni publicada sin pasar por el flujo
    if new.requires_approval and new.status in ('approved', 'scheduled', 'published') and auth.uid() is not null then
      raise exception 'Una publicación nueva no puede crearse ya aprobada. Solicita la aprobación primero.'
        using errcode = 'P0001';
    end if;
    if new.status = 'published' then
      new.published_at := coalesce(new.published_at, now());
      new.published_by := coalesce(new.published_by, auth.uid());
    end if;
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status = 'approved' and not via_rpc then
      raise exception 'Solo se puede aprobar desde el botón Aprobar (queda registrado quién aprueba).'
        using errcode = 'P0001';
    end if;
    if new.requires_approval and new.status in ('scheduled', 'published') and new.approved_at is null then
      raise exception 'Esta publicación necesita aprobación antes de programarse o publicarse.'
        using errcode = 'P0001';
    end if;
    if new.status = 'published' then
      new.published_at := now();
      new.published_by := auth.uid();
    elsif old.status = 'published' then
      new.published_at := null;
      new.published_by := null;
    end if;
    -- Si deja de estar aprobada (vuelve a diseño/revisión) se invalida la aprobación
    if new.status in ('idea', 'pending_prep', 'in_design', 'in_review', 'pending_approval') then
      new.approved_at := null;
      new.approved_by := null;
    end if;
  end if;
  return new;
end $$;

create trigger posts_before before insert or update on public.posts
  for each row execute function private.posts_before();

create or replace function private.posts_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  link text := '#/publicaciones/' || new.id;
  who text := coalesce(private.actor_name(auth.uid()), 'Sistema');
  label text := private.kind_label(new.kind);
  r record;
begin
  if tg_op = 'INSERT' then
    if new.import_key is null then
      perform private.log_activity('create', 'post', new.id,
        who || ' ha creado ' || lower(label) || ' «' || new.title || '»',
        jsonb_build_object('starts_at', new.starts_at, 'status', new.status));
    end if;
    if new.kind in ('event', 'meeting', 'special_date') and new.import_key is null then
      perform private.notify_all('event_created', 'Nuevo ' || lower(label) || ': ' || new.title,
        who || ' lo ha añadido al calendario para el ' || private.fmt_ts(new.starts_at), link);
    end if;
    if new.assignee_id is not null and new.import_key is null then
      perform private.notify(new.assignee_id, 'task_assigned', 'Te han asignado: ' || new.title,
        who || ' te ha asignado ' || lower(label), link);
    end if;
    if new.status = 'pending_approval' then
      insert into public.approvals (post_id, decision, decided_by) values (new.id, 'requested', auth.uid());
      for r in select id from public.profiles where active and can_approve loop
        perform private.notify(r.id, 'approval_requested', 'Aprobación pendiente: ' || new.title,
          who || ' solicita tu aprobación', link);
      end loop;
    end if;
    return new;
  end if;

  -- Historial de cambios campo a campo
  insert into public.post_history (post_id, field, old_value, new_value, changed_by)
  select new.id, f.field, f.o, f.n, auth.uid()
  from (values
    ('title', old.title, new.title),
    ('starts_at', private.fmt_ts(old.starts_at), private.fmt_ts(new.starts_at)),
    ('deadline', old.deadline::text, new.deadline::text),
    ('status', private.status_label(old.status), private.status_label(new.status)),
    ('kind', private.kind_label(old.kind), private.kind_label(new.kind)),
    ('platforms', array_to_string(old.platforms, ', '), array_to_string(new.platforms, ', ')),
    ('format', old.format, new.format),
    ('copy', old.copy, new.copy),
    ('hashtags', old.hashtags, new.hashtags),
    ('cta', old.cta, new.cta),
    ('objective', old.objective, new.objective),
    ('description', old.description, new.description),
    ('assignee', private.actor_name(old.assignee_id), private.actor_name(new.assignee_id))
  ) as f(field, o, n)
  where f.o is distinct from f.n;

  if new.starts_at is distinct from old.starts_at then
    perform private.log_activity('reschedule', 'post', new.id,
      who || ' ha cambiado la fecha de «' || new.title || '» al ' || private.fmt_ts(new.starts_at),
      jsonb_build_object('from', old.starts_at, 'to', new.starts_at));
    perform private.notify_all('date_changed', 'Fecha modificada: ' || new.title,
      who || ': ' || private.fmt_ts(old.starts_at) || ' → ' || private.fmt_ts(new.starts_at), link);
  end if;

  if new.status is distinct from old.status then
    perform private.log_activity('status', 'post', new.id,
      who || ' ha cambiado «' || new.title || '» a ' || private.status_label(new.status),
      jsonb_build_object('from', old.status, 'to', new.status));
    if new.status = 'pending_approval' then
      insert into public.approvals (post_id, version_id, decision, decided_by)
      values (new.id, (select id from public.post_versions where post_id = new.id order by version_no desc limit 1),
              'requested', auth.uid());
      for r in select id from public.profiles where active and can_approve loop
        perform private.notify(r.id, 'approval_requested', 'Aprobación pendiente: ' || new.title,
          who || ' solicita tu aprobación', link);
      end loop;
    elsif new.status = 'published' then
      perform private.notify_all('published', 'Publicado: ' || new.title,
        who || ' lo ha marcado como publicado', link);
    end if;
  elsif row(new.title, new.copy, new.hashtags, new.cta, new.description, new.platforms, new.format, new.deadline, new.objective)
        is distinct from row(old.title, old.copy, old.hashtags, old.cta, old.description, old.platforms, old.format, old.deadline, old.objective) then
    perform private.log_activity('update', 'post', new.id, who || ' ha editado «' || new.title || '»', null);
  end if;

  if new.assignee_id is distinct from old.assignee_id and new.assignee_id is not null then
    perform private.notify(new.assignee_id, 'task_assigned', 'Te han asignado: ' || new.title,
      who || ' te ha asignado ' || lower(label), link);
  end if;
  return new;
end $$;

create trigger posts_after after insert or update on public.posts
  for each row execute function private.posts_after();

create or replace function private.posts_after_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform private.log_activity('delete', 'post', old.id,
    coalesce(private.actor_name(auth.uid()), 'Sistema') || ' ha eliminado «' || old.title || '»', null);
  return old;
end $$;
create trigger posts_after_delete after delete on public.posts
  for each row execute function private.posts_after_delete();

-- Versiones: número correlativo, aviso y vuelta a revisión si ya estaba aprobada
create or replace function private.versions_before()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.post_id::text));
  select coalesce(max(version_no), 0) + 1 into new.version_no from public.post_versions where post_id = new.post_id;
  new.created_by := coalesce(new.created_by, auth.uid());
  return new;
end $$;
create trigger versions_before before insert on public.post_versions
  for each row execute function private.versions_before();

create or replace function private.versions_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare p public.posts; who text := coalesce(private.actor_name(auth.uid()), 'Sistema');
begin
  select * into p from public.posts where id = new.post_id;
  perform private.log_activity('version', 'post', new.post_id,
    who || ' ha subido la versión ' || new.version_no || ' de «' || p.title || '»',
    jsonb_build_object('version', new.version_no, 'note', new.note));
  perform private.notify_all('design_uploaded', 'Nuevo diseño (v' || new.version_no || '): ' || p.title,
    who || coalesce(': ' || new.note, ' ha subido una nueva versión'), '#/publicaciones/' || p.id);
  if p.status in ('approved', 'scheduled') then
    update public.posts set status = 'in_review' where id = p.id;
  end if;
  return new;
end $$;
create trigger versions_after after insert on public.post_versions
  for each row execute function private.versions_after();

-- =====================================================================
-- RPC: aprobación
-- =====================================================================
create or replace function public.decide_approval(p_post uuid, p_decision public.approval_decision, p_comment text default null)
returns public.approvals language plpgsql security definer set search_path = public as $$
declare
  p public.posts;
  a public.approvals;
  who text := private.actor_name(auth.uid());
  link text := '#/publicaciones/' || p_post;
begin
  if not public.can_approve() then
    raise exception 'No tienes permiso para aprobar publicaciones.' using errcode = '42501';
  end if;
  if p_decision = 'requested' then
    raise exception 'Decisión no válida.' using errcode = '22023';
  end if;
  if p_decision = 'changes_requested' and coalesce(trim(p_comment), '') = '' then
    raise exception 'Explica qué hay que cambiar.' using errcode = '22023';
  end if;
  select * into p from public.posts where id = p_post for update;
  if not found then raise exception 'Publicación no encontrada.'; end if;

  insert into public.approvals (post_id, version_id, decision, comment, decided_by)
  values (p_post, (select id from public.post_versions where post_id = p_post order by version_no desc limit 1),
          p_decision, nullif(trim(p_comment), ''), auth.uid())
  returning * into a;

  perform set_config('app.via_rpc', '1', true);
  if p_decision = 'approved' then
    update public.posts set status = 'approved', approved_by = auth.uid(), approved_at = now() where id = p_post;
    perform private.log_activity('approve', 'post', p_post, who || ' ha aprobado «' || p.title || '»',
      jsonb_build_object('comment', p_comment));
    perform private.notify(p.created_by, 'approved', 'Aprobado: ' || p.title, coalesce(p_comment, who || ' lo ha aprobado'), link);
    if p.assignee_id is distinct from p.created_by then
      perform private.notify(p.assignee_id, 'approved', 'Aprobado: ' || p.title, coalesce(p_comment, who || ' lo ha aprobado'), link);
    end if;
  else
    update public.posts set status = 'in_design' where id = p_post;
    perform private.log_activity('changes', 'post', p_post, who || ' ha pedido cambios en «' || p.title || '»',
      jsonb_build_object('comment', p_comment));
    perform private.notify(p.created_by, 'changes_requested', 'Cambios solicitados: ' || p.title, p_comment, link);
    if p.assignee_id is distinct from p.created_by then
      perform private.notify(p.assignee_id, 'changes_requested', 'Cambios solicitados: ' || p.title, p_comment, link);
    end if;
  end if;
  perform set_config('app.via_rpc', '', true);
  return a;
end $$;

-- Duplicar publicación (estructura, copy, plataformas; sin aprobación ni archivos de versión)
create or replace function public.duplicate_post(p_post uuid, p_starts_at timestamptz default null)
returns public.posts language plpgsql security invoker set search_path = public as $$
declare src public.posts; dst public.posts;
begin
  select * into src from public.posts where id = p_post;
  if not found then raise exception 'Publicación no encontrada.'; end if;
  insert into public.posts (kind, title, description, starts_at, all_day, deadline, platforms, format, objective,
    copy, hashtags, cta, material, status, is_draft, requires_approval, assignee_id, category_id, duplicated_from)
  values (src.kind, src.title || ' (copia)', src.description,
    coalesce(p_starts_at, src.starts_at + interval '7 days'), src.all_day,
    case when src.deadline is null then null else src.deadline + 7 end,
    src.platforms, src.format, src.objective, src.copy, src.hashtags, src.cta, null,
    'idea', true, src.requires_approval, src.assignee_id, src.category_id, src.id)
  returning * into dst;
  return dst;
end $$;

-- =====================================================================
-- Triggers: tareas
-- =====================================================================
create or replace function private.tasks_before()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' and new.created_by is null then new.created_by := auth.uid(); end if;
  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then new.completed_at := now(); end if;
  if new.status <> 'done' then new.completed_at := null; end if;
  return new;
end $$;
create trigger tasks_before before insert or update on public.tasks
  for each row execute function private.tasks_before();

create or replace function private.tasks_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare who text := coalesce(private.actor_name(auth.uid()), 'Sistema'); link text := '#/tareas/' || new.id;
begin
  if tg_op = 'INSERT' then
    perform private.log_activity('create', 'task', new.id, who || ' ha creado la tarea «' || new.title || '»', null);
    perform private.notify(new.assignee_id, 'task_assigned', 'Nueva tarea: ' || new.title,
      who || ' te la ha asignado' || coalesce(' · vence el ' || to_char(new.due_date, 'DD/MM'), ''), link);
    return new;
  end if;
  if new.assignee_id is distinct from old.assignee_id then
    perform private.notify(new.assignee_id, 'task_assigned', 'Tarea asignada: ' || new.title, who || ' te la ha asignado', link);
  end if;
  if new.status is distinct from old.status then
    if new.status = 'done' then
      perform private.log_activity('complete', 'task', new.id, who || ' ha completado la tarea «' || new.title || '»', null);
      perform private.notify(new.created_by, 'task_done', 'Tarea completada: ' || new.title, who || ' la ha completado', link);
    else
      perform private.log_activity('status', 'task', new.id,
        who || ' ha movido «' || new.title || '» a ' ||
        case new.status when 'pending' then 'Pendiente' when 'in_progress' then 'En proceso'
          when 'in_review' then 'En revisión' else 'Completada' end, null);
    end if;
  end if;
  if new.due_date is distinct from old.due_date then
    perform private.notify_all('date_changed', 'Fecha límite cambiada: ' || new.title,
      who || ': ' || coalesce(to_char(old.due_date, 'DD/MM'), 'sin fecha') || ' → ' || coalesce(to_char(new.due_date, 'DD/MM'), 'sin fecha'), link);
  end if;
  return new;
end $$;
create trigger tasks_after after insert or update on public.tasks
  for each row execute function private.tasks_after();

-- =====================================================================
-- Triggers: comentarios, chat, biblioteca, adjuntos
-- =====================================================================
create or replace function private.comments_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  who text := coalesce(private.actor_name(auth.uid()), 'Alguien');
  ttl text; link text; r record;
begin
  if new.post_id is not null then
    select title into ttl from public.posts where id = new.post_id;
    link := '#/publicaciones/' || new.post_id;
    for r in
      select distinct uid from (
        select created_by as uid from public.posts where id = new.post_id
        union select assignee_id from public.posts where id = new.post_id
        union select created_by from public.comments where post_id = new.post_id
        union select id from public.profiles where can_approve and active
      ) s where uid is not null
    loop
      perform private.notify(r.uid, 'comment', who || ' ha comentado en «' || ttl || '»', new.body, link);
    end loop;
    perform private.log_activity('comment', 'post', new.post_id, who || ' ha comentado en «' || ttl || '»', null);
  else
    select title into ttl from public.tasks where id = new.task_id;
    link := '#/tareas/' || new.task_id;
    for r in
      select distinct uid from (
        select created_by as uid from public.tasks where id = new.task_id
        union select assignee_id from public.tasks where id = new.task_id
        union select created_by from public.comments where task_id = new.task_id
      ) s where uid is not null
    loop
      perform private.notify(r.uid, 'comment', who || ' ha comentado en la tarea «' || ttl || '»', new.body, link);
    end loop;
    perform private.log_activity('comment', 'task', new.task_id, who || ' ha comentado en la tarea «' || ttl || '»', null);
  end if;
  return new;
end $$;
create trigger comments_after after insert on public.comments
  for each row execute function private.comments_after();

create or replace function private.chat_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare who text := coalesce(private.actor_name(auth.uid()), 'Alguien');
begin
  perform private.notify_all('message', 'Mensaje de ' || who,
    case when coalesce(new.body, '') = '' then '📎 Archivo adjunto' else new.body end, '#/chat');
  insert into public.chat_reads (user_id, channel, last_read_at) values (new.created_by, new.channel, new.created_at)
  on conflict (user_id, channel) do update set last_read_at = greatest(public.chat_reads.last_read_at, excluded.last_read_at);
  return new;
end $$;
create trigger chat_after after insert on public.chat_messages
  for each row execute function private.chat_after();

-- Por sentencia: si se añaden 70 fotos de golpe llega UN aviso, no 70.
create or replace function private.library_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  who text := coalesce(private.actor_name(auth.uid()), 'Alguien');
  n int; first_name text; cats text;
begin
  select count(*), min(name) into n, first_name from new_rows;
  if n = 0 then return null; end if;
  select string_agg(distinct c.name, ', ') into cats from new_rows r join public.library_categories c on c.id = r.category_id;
  if n = 1 then
    perform private.log_activity('library', 'library_item', (select id from new_rows limit 1),
      who || ' ha añadido «' || first_name || '» a la biblioteca' || coalesce(' (' || cats || ')', ''), null);
    perform private.notify_all('library_added', 'Nuevo en la biblioteca: ' || first_name, who || coalesce(' · ' || cats, ''), '#/biblioteca');
  else
    perform private.log_activity('library', 'library_item', null,
      who || ' ha añadido ' || n || ' archivos a la biblioteca' || coalesce(' (' || cats || ')', ''), jsonb_build_object('count', n));
    perform private.notify_all('library_added', n || ' archivos nuevos en la biblioteca', who || coalesce(' · ' || cats, ''), '#/biblioteca');
  end if;
  return null;
end $$;
create trigger library_after after insert on public.library_items
  referencing new table as new_rows
  for each statement execute function private.library_after();

-- =====================================================================
-- Recordatorios de fechas límite (pg_cron, cada día a las 08:00 de Canarias)
-- =====================================================================
create or replace function private.deadline_reminders()
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; today date := (now() at time zone 'Atlantic/Canary')::date;
begin
  for r in
    select t.id, t.title, t.due_date, coalesce(t.assignee_id, t.created_by) as uid
    from public.tasks t
    where t.status <> 'done' and t.due_date between today and today + 1
  loop
    if not exists (select 1 from public.notifications where user_id = r.uid and type = 'deadline'
                   and link = '#/tareas/' || r.id and created_at::date = now()::date) then
      insert into public.notifications (user_id, type, title, body, link)
      select r.uid, 'deadline',
        case when r.due_date = today then 'Vence HOY: ' else 'Vence mañana: ' end || r.title,
        'Fecha límite ' || to_char(r.due_date, 'DD/MM'), '#/tareas/' || r.id
      where coalesce((select (prefs->>'deadline')::boolean from public.notification_prefs where user_id = r.uid), true);
      n := n + 1;
    end if;
  end loop;
  for r in
    select p.id, p.title, p.starts_at, p.deadline, coalesce(p.assignee_id, p.created_by) as uid
    from public.posts p
    where p.status not in ('scheduled', 'published')
      and (p.deadline between today and today + 1
        or (p.starts_at at time zone 'Atlantic/Canary')::date between today and today + 1)
  loop
    if not exists (select 1 from public.notifications where user_id = r.uid and type = 'deadline'
                   and link = '#/publicaciones/' || r.id and created_at::date = now()::date) then
      insert into public.notifications (user_id, type, title, body, link)
      select r.uid, 'deadline', 'Se acerca: ' || r.title,
        'Aún no está programada · ' || private.fmt_ts(r.starts_at), '#/publicaciones/' || r.id
      where coalesce((select (prefs->>'deadline')::boolean from public.notification_prefs where user_id = r.uid), true);
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;

-- =====================================================================
-- Push: cada notificación nueva llama a la Edge Function send-push
-- (solo si se ha configurado private.settings push_url / push_secret)
-- =====================================================================
create or replace function private.dispatch_push()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare url text; secret text;
begin
  select value into url from private.settings where key = 'push_url';
  select value into secret from private.settings where key = 'push_secret';
  if url is null or secret is null then return new; end if;
  if not exists (select 1 from public.push_subscriptions where user_id = new.user_id) then return new; end if;
  if exists (select 1 from public.notification_prefs where user_id = new.user_id and push_enabled = false) then return new; end if;
  perform net.http_post(
    url := url,
    body := jsonb_build_object('notification_id', new.id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', secret)
  );
  return new;
exception when others then
  return new; -- nunca bloquear la notificación in-app por un fallo de push
end $$;
create trigger notifications_push after insert on public.notifications
  for each row execute function private.dispatch_push();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.library_categories enable row level security;
alter table public.library_items enable row level security;
alter table public.posts enable row level security;
alter table public.post_versions enable row level security;
alter table public.approvals enable row level security;
alter table public.post_history enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_reads enable row level security;
alter table public.attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_prefs enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.activity_log enable row level security;

-- Perfiles
create policy "miembros ven perfiles" on public.profiles for select to authenticated using (public.is_member() or id = auth.uid());
create policy "cada uno edita su perfil" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "admin edita perfiles" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Evita que un usuario se dé a sí mismo permisos
create or replace function private.profiles_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Nadie puede cambiar sus propios permisos (ni siquiera un admin): así quien prepara
  -- el contenido no puede autoaprobarse.
  if auth.uid() is not null and new.id = auth.uid() and (
       new.role is distinct from old.role or new.is_admin is distinct from old.is_admin
       or new.can_approve is distinct from old.can_approve or new.active is distinct from old.active) then
    raise exception 'No puedes cambiar tus propios permisos. Pídeselo a otro administrador.' using errcode = '42501';
  end if;
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role or new.is_admin is distinct from old.is_admin
       or new.can_approve is distinct from old.can_approve or new.active is distinct from old.active
       or new.email is distinct from old.email then
      raise exception 'Solo un administrador puede cambiar roles y permisos.' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles for each row execute function private.profiles_guard();

-- Ajustes
create policy "miembros leen ajustes" on public.app_settings for select to authenticated using (public.is_member());
create policy "admin escribe ajustes" on public.app_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Biblioteca
create policy "miembros ven categorías" on public.library_categories for select to authenticated using (public.is_member());
create policy "miembros crean categorías" on public.library_categories for insert to authenticated with check (public.is_member());
create policy "admin/marketing editan categorías" on public.library_categories for update to authenticated
  using (public.is_admin() or exists (select 1 from public.profiles where id = auth.uid() and role = 'marketing'));
create policy "admin/marketing borran categorías" on public.library_categories for delete to authenticated
  using (public.is_admin() or exists (select 1 from public.profiles where id = auth.uid() and role = 'marketing'));

create policy "miembros ven biblioteca" on public.library_items for select to authenticated using (public.is_member());
create policy "miembros añaden a biblioteca" on public.library_items for insert to authenticated with check (public.is_member());
create policy "miembros editan biblioteca" on public.library_items for update to authenticated using (public.is_member());
create policy "autor o admin borra de biblioteca" on public.library_items for delete to authenticated
  using (added_by = auth.uid() or public.is_admin());

-- Publicaciones
create policy "miembros ven publicaciones" on public.posts for select to authenticated using (public.is_member());
create policy "miembros crean publicaciones" on public.posts for insert to authenticated with check (public.is_member());
create policy "miembros editan publicaciones" on public.posts for update to authenticated using (public.is_member()) with check (public.is_member());
create policy "autor o admin borra publicaciones" on public.posts for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

create policy "miembros ven versiones" on public.post_versions for select to authenticated using (public.is_member());
create policy "miembros suben versiones" on public.post_versions for insert to authenticated with check (public.is_member());

create policy "miembros ven aprobaciones" on public.approvals for select to authenticated using (public.is_member());
-- (las aprobaciones solo se insertan mediante triggers y decide_approval)

create policy "miembros ven historial" on public.post_history for select to authenticated using (public.is_member());

-- Tareas
create policy "miembros ven tareas" on public.tasks for select to authenticated using (public.is_member());
create policy "miembros crean tareas" on public.tasks for insert to authenticated with check (public.is_member());
create policy "miembros editan tareas" on public.tasks for update to authenticated using (public.is_member()) with check (public.is_member());
create policy "autor o admin borra tareas" on public.tasks for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- Comentarios
create policy "miembros ven comentarios" on public.comments for select to authenticated using (public.is_member());
create policy "miembros comentan" on public.comments for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
create policy "autor edita comentario" on public.comments for update to authenticated using (created_by = auth.uid());
create policy "autor borra comentario" on public.comments for delete to authenticated using (created_by = auth.uid() or public.is_admin());

-- Chat
create policy "miembros leen chat" on public.chat_messages for select to authenticated using (public.is_member());
create policy "miembros escriben" on public.chat_messages for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
create policy "autor edita mensaje" on public.chat_messages for update to authenticated using (created_by = auth.uid());

create policy "miembros ven lecturas" on public.chat_reads for select to authenticated using (public.is_member());
create policy "cada uno marca leído" on public.chat_reads for insert to authenticated with check (user_id = auth.uid());
create policy "cada uno actualiza leído" on public.chat_reads for update to authenticated using (user_id = auth.uid());

-- Adjuntos
create policy "miembros ven adjuntos" on public.attachments for select to authenticated using (public.is_member());
create policy "miembros adjuntan" on public.attachments for insert to authenticated with check (public.is_member());
create policy "autor o admin quita adjunto" on public.attachments for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- Notificaciones (cada uno las suyas)
create policy "ver mis notificaciones" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "marcar mis notificaciones" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "borrar mis notificaciones" on public.notifications for delete to authenticated using (user_id = auth.uid());

create policy "ver mis preferencias" on public.notification_prefs for select to authenticated using (user_id = auth.uid());
create policy "crear mis preferencias" on public.notification_prefs for insert to authenticated with check (user_id = auth.uid());
create policy "editar mis preferencias" on public.notification_prefs for update to authenticated using (user_id = auth.uid());

create policy "ver mis suscripciones" on public.push_subscriptions for select to authenticated using (user_id = auth.uid());
create policy "crear mis suscripciones" on public.push_subscriptions for insert to authenticated with check (user_id = auth.uid());
create policy "borrar mis suscripciones" on public.push_subscriptions for delete to authenticated using (user_id = auth.uid());

-- Actividad (solo lectura; se escribe desde triggers)
create policy "miembros ven actividad" on public.activity_log for select to authenticated using (public.is_member());

-- Permisos de ejecución
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function public.decide_approval(uuid, public.approval_decision, text) to authenticated;
grant execute on function public.duplicate_post(uuid, timestamptz) to authenticated;
revoke execute on function public.decide_approval(uuid, public.approval_decision, text) from anon;
revoke execute on function public.duplicate_post(uuid, timestamptz) from anon;

-- =====================================================================
-- Realtime
-- =====================================================================
alter publication supabase_realtime add table
  public.profiles, public.posts, public.post_versions, public.approvals, public.tasks,
  public.comments, public.chat_messages, public.chat_reads, public.attachments,
  public.notifications, public.activity_log, public.library_items, public.library_categories;

-- =====================================================================
-- Storage: bucket privado para ficheros subidos desde la app
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('hub', 'hub', false, 52428800)
on conflict (id) do nothing;

create policy "miembros leen ficheros hub" on storage.objects for select to authenticated
  using (bucket_id = 'hub' and public.is_member());
create policy "miembros suben ficheros hub" on storage.objects for insert to authenticated
  with check (bucket_id = 'hub' and public.is_member());
create policy "autor borra ficheros hub" on storage.objects for delete to authenticated
  using (bucket_id = 'hub' and (owner = auth.uid() or public.is_admin()));

-- =====================================================================
-- Datos iniciales: categorías de la biblioteca
-- =====================================================================
insert into public.library_categories (name, slug, icon, sort, created_by) values
  ('Fotografías', 'fotografias', 'image', 10, null),
  ('Vídeos', 'videos', 'video', 20, null),
  ('Diseños', 'disenos', 'palette', 30, null),
  ('Champions League', 'champions', 'trophy', 40, null),
  ('Carteles semanales', 'carteles-semanales', 'poster', 50, null),
  ('Carruseles', 'carruseles', 'layers', 60, null),
  ('Eventos', 'eventos', 'music', 70, null),
  ('Promociones', 'promociones', 'tag', 80, null),
  ('Navidad', 'navidad', 'star', 90, null),
  ('Publicaciones anteriores', 'anteriores', 'history', 100, null),
  ('Pendiente de publicar', 'pendiente', 'clock', 110, null),
  ('Archivo', 'archivo', 'archive', 120, null);

insert into public.app_settings (key, value) values
  ('drive', jsonb_build_object(
    'root_folder_id', '1BaYFxax3grsCZL4nUI_M4H97kYZuh9Do',
    'root_folder_name', 'Grupo 5mentarios',
    'shortcuts', jsonb_build_array(
      jsonb_build_object('id', '1Gk-tHTFAO18a1sAI5kMfrkE8X6VmxnjS', 'name', 'Heineken (fotos y vídeos)'),
      jsonb_build_object('id', '1CQ8lVoyP79hF5YJw7HJA8LCk7os9RxSk', 'name', 'Heineken 5mentarios (web y logos)'),
      jsonb_build_object('id', '1NGZLOf7KMc1h4fF2s_4lahOnx81nonJr', 'name', 'Material general (Halloween, Champions, carteles)')
    )
  ));

-- ===== supabase/migrations/20261111000002_cron.sql =====
-- Recordatorio diario de fechas límite (08:00 hora de Canarias en invierno = 08:00 UTC)
create extension if not exists pg_cron;
select cron.schedule('social-hub-deadlines', '0 8 * * *', $$select private.deadline_reminders()$$);

-- Permite lanzar los recordatorios manualmente (solo service_role, p. ej. para pruebas)
create or replace function public.run_deadline_reminders_for_tests()
returns int language sql security definer set search_path = public as $$ select private.deadline_reminders(); $$;
revoke execute on function public.run_deadline_reminders_for_tests() from public, anon, authenticated;
grant execute on function public.run_deadline_reminders_for_tests() to service_role;

-- ===== supabase/migrations/20261111000003_backfill.sql =====
-- Crea el perfil de los usuarios que ya existían en Authentication antes de instalar
-- (mismas reglas que el alta normal: el primero es Marketing + Administrador).
insert into public.profiles (id, email, full_name, role, is_admin, can_approve, color)
select u.id, u.email,
  coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)),
  r.role, r.n = 1, r.role = 'owner',
  case r.role when 'owner' then '#F2A541' when 'marketing' then '#34C26B' else '#7FB3FF' end
from auth.users u
join lateral (
  select n, coalesce(nullif(u.raw_user_meta_data->>'role', '')::public.user_role,
                     case when n = 1 then 'marketing'::public.user_role else 'collaborator'::public.user_role end) as role
  from (select row_number() over (order by created_at) as n, id from auth.users) x where x.id = u.id
) r on true
where not exists (select 1 from public.profiles)
on conflict (id) do nothing;
insert into public.notification_prefs (user_id) select id from public.profiles on conflict do nothing;

-- ===== supabase/migrations/20261112000004_studio.sql =====
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

