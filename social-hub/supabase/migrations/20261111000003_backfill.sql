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
