-- Recordatorio diario de fechas límite (08:00 hora de Canarias en invierno = 08:00 UTC)
create extension if not exists pg_cron;
select cron.schedule('social-hub-deadlines', '0 8 * * *', $$select private.deadline_reminders()$$);

-- Permite lanzar los recordatorios manualmente (solo service_role, p. ej. para pruebas)
create or replace function public.run_deadline_reminders_for_tests()
returns int language sql security definer set search_path = public as $$ select private.deadline_reminders(); $$;
revoke execute on function public.run_deadline_reminders_for_tests() from public, anon, authenticated;
grant execute on function public.run_deadline_reminders_for_tests() to service_role;
