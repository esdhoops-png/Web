// Prueba real del canal push: notificación en BD → trigger (pg_net) → Edge Function send-push
// → petición Web Push cifrada (VAPID + aes128gcm) a un servicio push de prueba que la descifra.
// Uso: SUPABASE_ANON_KEY=... SUPABASE_SERVICE_KEY=... PUSH_HOST=172.18.0.1 node push.test.mjs
import { createClient } from '@supabase/supabase-js';
import https from 'node:https';
import fs from 'node:fs';
import crypto from 'node:crypto';
import ece from 'http_ece';
import assert from 'node:assert/strict';
import pg from 'node:child_process';

const URL = 'http://127.0.0.1:54321';
const admin = createClient(URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
const PORT = 9099;
const HOST = process.env.PUSH_HOST || '172.18.0.1';

// claves del "navegador" de prueba
const ecdh = crypto.createECDH('prime256v1'); ecdh.generateKeys();
const authSecret = crypto.randomBytes(16);
const b64u = (b) => b.toString('base64url');

const received = new Promise((resolve, reject) => {
  const srv = https.createServer({ key: fs.readFileSync(process.env.PUSH_TLS_KEY), cert: fs.readFileSync(process.env.PUSH_TLS_CERT) }, (req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      res.writeHead(201); res.end();
      srv.close();
      try {
        const body = Buffer.concat(chunks);
        const plain = ece.decrypt(body, { version: 'aes128gcm', privateKey: ecdh, authSecret });
        resolve({ headers: req.headers, payload: JSON.parse(plain.toString()) });
      } catch (e) { reject(e); }
    });
  }).listen(PORT, '0.0.0.0');
  setTimeout(() => { srv.close(); reject(new Error('No llegó ninguna petición push en 20 s')); }, 20000);
});

const { data: users } = await admin.auth.admin.listUsers();
const owner = users.users.find((u) => u.email === 'propietario@test.local');
const mk = users.users.find((u) => u.email === 'marketing@test.local');
assert.ok(owner && mk, 'ejecuta antes api.test.mjs para crear los usuarios');

// configuración del dispatch (en producción: ver README → Push)
const sql = (q) => pg.execSync(`psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -v ON_ERROR_STOP=1 -qtAc "${q}"`).toString();
sql(`insert into private.settings values ('push_url','http://' || '${process.env.FN_HOST || 'supabase_kong_social-hub:8000/functions/v1'}' || '/send-push'),('push_secret','local-test-secret') on conflict (key) do update set value = excluded.value`);

await admin.from('push_subscriptions').delete().eq('user_id', owner.id);
await admin.from('push_subscriptions').insert({ user_id: owner.id, endpoint: `https://${HOST}:${PORT}/push/test-device`, p256dh: b64u(ecdh.getPublicKey()), auth: b64u(authSecret) });

// el marketing escribe en el chat → el propietario debe recibir el push
const c = createClient(URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
await c.auth.signInWithPassword({ email: 'marketing@test.local', password: 'Prueba-1234' });
const { error } = await c.from('chat_messages').insert({ body: 'Prueba de push: ¿te llega al móvil?', created_by: mk.id });
assert.ifError(error);

const { headers, payload } = await received;
assert.match(headers.authorization || '', /^vapid t=.+, k=.+/);
assert.equal(headers['content-encoding'], 'aes128gcm');
assert.equal(payload.title, 'Mensaje de Responsable Marketing');
assert.equal(payload.body, 'Prueba de push: ¿te llega al móvil?');
assert.equal(payload.link, '#/chat');
console.log('  ✓ push recibido y descifrado:', payload.title, '—', payload.body);

await admin.from('push_subscriptions').delete().eq('user_id', owner.id);
await admin.from('chat_messages').delete().eq('body', 'Prueba de push: ¿te llega al móvil?');
sql(`delete from private.settings`);
console.log('Push E2E OK');
