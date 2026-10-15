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

responder(true, '¡Apuntado! El domingo te llega el primer plan.');
