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
drop table if exists public.activity_log, public.push_subscriptions, public.notification_prefs, public.notifications,
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
