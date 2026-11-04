// Envía el mensaje de ánimo del día a Cristina por ntfy (mismo mensaje que sale en la app).
const fs = require("fs");
const A = JSON.parse(fs.readFileSync("taxi-telde/animo.json", "utf8"));
const TOPIC = "cristina-taxi-f08196fedf";
const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Atlantic/Canary" }));
const hoy = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
const quedan = Math.round((Date.UTC(2026, 10, 19) - hoy) / 86400000);
if (quedan < -1) { console.log("Examen pasado: no se envía nada."); process.exit(0); }
let msg;
if (quedan === 0) msg = A.examen; else if (quedan === 1) msg = A.vispera; else if (quedan < 0) msg = A.despues;
else { const n = Math.floor((hoy - Date.UTC(2026, 9, 23)) / 86400000); msg = A.diarios[((n % A.diarios.length) + A.diarios.length) % A.diarios.length]; }
const extra = quedan > 1 ? `\n\nQuedan ${quedan} días para el examen.` : "";
fetch("https://ntfy.sh/", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ topic: TOPIC, title: "Para ti, Cristina", message: msg + extra, tags: ["blue_heart"], priority: 4, click: "https://esdhoops-png.github.io/Web/taxi-telde/" }) })
  .then(r => r.text().then(t => { console.log(r.status, t); if (!r.ok) process.exit(1); }));
