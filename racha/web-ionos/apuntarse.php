<?php
// Recibe el email del formulario "Me apunto", lo guarda en una lista privada
// y avisa por correo a la cuenta de Racha Lab.

$AVISAR_A   = 'info@somosrachalab.com';   // correo que recibe los avisos
$REMITENTE  = 'info@somosrachalab.com';   // debe ser un buzón real del dominio en IONOS
$CARPETA    = __DIR__ . '/../datos';      // fuera de /public: nadie puede abrirla desde la web

header('Content-Type: application/json; charset=utf-8');

function responder($ok, $msg, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'msg' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') responder(false, 'Método no permitido', 405);

// Campo trampa: los humanos no lo ven; si viene relleno, es un bot.
if (!empty($_POST['web'])) responder(true, 'ok');

$email = trim($_POST['email'] ?? '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    responder(false, 'Revisa el email, parece que no es correcto.', 400);
}

if (!is_dir($CARPETA)) @mkdir($CARPETA, 0750, true);
if (!is_dir($CARPETA) || !is_writable($CARPETA)) {
    // Si el hosting no deja escribir fuera de /public, usa una carpeta protegida dentro.
    $CARPETA = __DIR__ . '/datos';
    if (!is_dir($CARPETA)) @mkdir($CARPETA, 0750, true);
    if (!file_exists($CARPETA . '/.htaccess')) @file_put_contents($CARPETA . '/.htaccess', "Require all denied\nDeny from all\n");
}

// Límite sencillo: máximo 5 envíos por IP y hora.
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$limite = $CARPETA . '/limite-' . md5($ip . date('YmdH')) . '.txt';
$n = (int) @file_get_contents($limite);
if ($n >= 5) responder(false, 'Demasiados intentos. Prueba más tarde.', 429);
@file_put_contents($limite, $n + 1);

// Guardar en la lista (sin duplicados).
$lista = $CARPETA . '/suscriptores.csv';
$existe = false;
if (file_exists($lista)) {
    foreach (file($lista, FILE_IGNORE_NEW_LINES) as $linea) {
        if (strcasecmp(explode(',', $linea)[0], $email) === 0) { $existe = true; break; }
    }
} else {
    file_put_contents($lista, "email,fecha,origen\n");
}
if ($existe) responder(true, 'Ya estabas apuntado. ¡Nos vemos el domingo!');

$fp = fopen($lista, 'a');
if (!$fp || !flock($fp, LOCK_EX)) responder(false, 'No se pudo guardar. Inténtalo de nuevo.', 500);
fputcsv($fp, [$email, date('Y-m-d H:i'), 'web']);
flock($fp, LOCK_UN);
fclose($fp);

$total = max(0, count(file($lista)) - 1);

// Aviso por correo.
$asunto  = '=?UTF-8?B?' . base64_encode('Nuevo suscriptor en Racha Lab (' . $total . ')') . '?=';
$cuerpo  = "Se ha apuntado alguien a El Domingo:\n\n"
         . "Email: $email\n"
         . "Fecha: " . date('d/m/Y H:i') . "\n"
         . "Total en la lista: $total\n";
$cabeceras = "From: Racha Lab <$REMITENTE>\r\n"
           . "Reply-To: $email\r\n"
           . "Content-Type: text/plain; charset=UTF-8\r\n";
@mail($AVISAR_A, $asunto, $cuerpo, $cabeceras, '-f' . $REMITENTE);

// Correo de bienvenida a la persona que se apunta (solo la primera vez).
$web = 'https://somosrachalab.com';
$ig  = 'https://www.instagram.com/somosrachalab/';
$asuntoB = '=?UTF-8?B?' . base64_encode('Bienvenido a Racha Lab: empieza aquí') . '?=';
$texto = "¡Bienvenido a Racha Lab!\n\n"
       . "Desde ahora, cada domingo te llega \"El Domingo\": el plan de la semana del reto y una idea para no romper la racha.\n\n"
       . "Para empezar, solo 4 hábitos (semana 1):\n"
       . "1. Agua al despertar. Mínimo: un vaso antes del café.\n"
       . "2. 10 min de luz natural. Mínimo: café junto a la ventana abierta.\n"
       . "3. Camina 8.000 pasos. Mínimo: una vuelta a la manzana.\n"
       . "4. Misma hora para dormir. Mínimo: una alarma para ir a la cama.\n\n"
       . "Los días malos también cuentan: haz la versión mínima y la racha sigue viva.\n\n"
       . "Apunta tus días en $web y síguenos en Instagram: $ig\n\n"
       . "Un 1% mejor cada día.\nRacha Lab\n\n"
       . "¿No quieres recibir más correos? Responde a este email con la palabra BAJA.";
$fila = function ($n, $h, $m) {
    return '<tr><td style="padding:14px 0;border-top:1px solid #DCD5CF;width:44px;vertical-align:top;font:800 18px Arial,sans-serif;color:#FF5A1F">' . $n . '</td>'
         . '<td style="padding:14px 0;border-top:1px solid #DCD5CF"><div style="font:700 17px Arial,sans-serif;color:#111">' . $h . '</div>'
         . '<div style="font:14px Arial,sans-serif;color:#6B645F;margin-top:4px">Mínimo: ' . $m . '</div></td></tr>';
};
$html = '<!doctype html><html><body style="margin:0;background:#EEE9E5">'
      . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#EEE9E5"><tr><td align="center" style="padding:28px 14px">'
      . '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#F7F4F1;border-radius:18px"><tr><td style="padding:34px 30px">'
      . '<div style="font:italic 18px Georgia,serif;color:#111">racha<b style="font:900 18px Arial,sans-serif">lab</b><span style="color:#FF5A1F">.</span></div>'
      . '<h1 style="margin:28px 0 0;font:italic 38px/1.05 Georgia,serif;color:#111">Bienvenido.</h1>'
      . '<div style="font:900 30px/1.1 Arial,sans-serif;color:#111;margin-top:4px">Tu racha empieza hoy.</div>'
      . '<p style="font:16px/1.55 Arial,sans-serif;color:#111;margin:20px 0 0">Cada domingo te llega <b>El Domingo</b>: el plan de la semana del reto y una idea para no romper la racha.</p>'
      . '<p style="font:700 12px Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6B645F;margin:30px 0 4px">Semana 1 · solo 4 hábitos</p>'
      . '<table width="100%" cellpadding="0" cellspacing="0">'
      . $fila('01', 'Agua al despertar', 'un vaso antes del café.')
      . $fila('10', '10 min de luz natural', 'café junto a la ventana abierta.')
      . $fila('05', 'Camina 8.000 pasos', 'una vuelta a la manzana.')
      . $fila('12', 'Misma hora para dormir', 'una alarma para ir a la cama.')
      . '</table>'
      . '<p style="font:16px/1.55 Arial,sans-serif;color:#111;margin:24px 0 0">Los días malos también cuentan: haz la versión mínima y la racha sigue viva.</p>'
      . '<table cellpadding="0" cellspacing="0" style="margin-top:26px"><tr><td style="background:#111;border-radius:999px">'
      . '<a href="' . $web . '" style="display:inline-block;padding:14px 26px;font:700 15px Arial,sans-serif;color:#EEE9E5;text-decoration:none">Apuntar mi primer día</a></td></tr></table>'
      . '<p style="font:14px/1.55 Arial,sans-serif;color:#6B645F;margin:26px 0 0">Comparte tu día en stories con <b style="color:#111">#MiRacha</b> y menciona a <a href="' . $ig . '" style="color:#FF5A1F">@somosrachalab</a>.</p>'
      . '</td></tr></table>'
      . '<p style="font:12px/1.5 Arial,sans-serif;color:#6B645F;max-width:520px;margin:16px auto 0">Recibes este correo porque te apuntaste en somosrachalab.com. ¿No quieres más correos? Responde con la palabra <b>BAJA</b>.</p>'
      . '</td></tr></table></body></html>';
$limiteB = 'b' . md5(uniqid('', true));
$cabB = "From: Racha Lab <$REMITENTE>\r\n"
      . "Reply-To: $REMITENTE\r\n"
      . "MIME-Version: 1.0\r\n"
      . "List-Unsubscribe: <mailto:$REMITENTE?subject=BAJA>\r\n"
      . "Content-Type: multipart/alternative; boundary=\"$limiteB\"\r\n";
$cuerpoB = "--$limiteB\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
         . chunk_split(base64_encode($texto))
         . "--$limiteB\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
         . chunk_split(base64_encode($html))
         . "--$limiteB--\r\n";
@mail($email, $asuntoB, $cuerpoB, $cabB, '-f' . $REMITENTE);

responder(true, '¡Apuntado! El domingo te llega el primer plan.');
