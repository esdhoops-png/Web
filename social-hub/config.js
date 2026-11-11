// Configuración de 5 Mentarios Social Hub.
// Estos valores son PÚBLICOS por diseño (la seguridad la ponen el login y las
// políticas RLS de la base de datos). Nunca pongas aquí la "service_role key".
window.HUB_CONFIG = {
  // Supabase → Project Settings → API
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU-ANON-KEY',

  // Google Cloud → APIs y servicios → Credenciales → ID de cliente OAuth (aplicación web)
  googleClientId: '',

  // Clave pública VAPID para notificaciones push (ver README, apartado Push)
  vapidPublicKey: ''
};
