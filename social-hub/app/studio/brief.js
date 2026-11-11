// Asistente de briefing POR REGLAS (sin IA): convierte una instrucción escrita en una propuesta
// con plantilla, formato y datos. Lo que no se puede deducir del texto se deja como [POR CONFIRMAR].
import { PEOPLE } from '../lib/brand.js';

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DAYS_PLAIN = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const pad = (n) => String(n).padStart(2, '0');

function findDate(t, today = new Date()) {
  const n = norm(t);
  let m = n.match(/\b(\d{1,2})[\/.-](\d{1,2})\b/);
  if (m) return new Date(today.getFullYear(), +m[2] - 1, +m[1]);
  m = n.match(/\b(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/);
  if (m) return new Date(today.getFullYear(), MONTHS.indexOf(m[2]), +m[1]);
  if (/\bpasado manana\b/.test(n)) return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
  if (/\bmanana\b/.test(n)) return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (/\bhoy\b/.test(n)) return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const i = DAYS_PLAIN.findIndex((d) => new RegExp(`\\b${d}\\b`).test(n));
  if (i >= 0) { const add = (i - today.getDay() + 7) % 7 || 7; return new Date(today.getFullYear(), today.getMonth(), today.getDate() + (add === 7 && /\beste\b|\besta\b/.test(n) ? 0 : add)); }
  return null;
}
function findTime(t) {
  const n = norm(t);
  let m = n.match(/\b(\d{1,2})[:.h](\d{2})\b/); if (m) return `${pad(m[1])}:${m[2]}`;
  m = n.match(/\ba las (\d{1,2})\b/); if (m) return `${pad(m[1])}:00`;
  return null;
}
function findTeams(t) {
  const m = t.match(/([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñç.' ]{1,30}?)\s+(?:vs\.?|contra|-)\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñç.' ]{1,30})/);
  return m ? [m[1].trim(), m[2].trim().replace(/[.,;].*$/, '')] : null;
}

export function interpret(text, today = new Date()) {
  const n = norm(text);
  const notes = [];
  let format = /\bstor(y|ies)\b|\bhistoria\b|\breel\b|vertical/.test(n) ? 'story' : /cuadrad/.test(n) ? 'square' : /horizontal|pantalla|televisi|youtube|16:9/.test(n) ? 'landscape' : 'post';
  let key = 'programacion';
  if (/champions|partido|futbol|clasico|liga\b|derbi/.test(n)) key = /portada|vuelve la champions/.test(n) ? 'champions-portada' : 'champions-partido';
  else if (/monolog|humor|comic/.test(n)) key = 'monologos';
  else if (/menu/.test(n) && /navidad/.test(n)) key = 'navidad-menus';
  else if (/line.?up|cartel de artistas|polaroid/.test(n)) key = 'lineup';
  else if (/tardeo|halloween/.test(n)) key = 'tardeo';
  else if (/\bhoy\b/.test(n) && format === 'story') key = 'story-hoy';
  else if (/asi fue|fotos de la noche|carrusel de fotos/.test(n)) key = 'fotos-portada';
  else if (/felicit|feliz navidad|feliz ano|aniversario|logo/.test(n)) key = 'marca';
  else if (/programacion|este finde|fin de semana|cartel/.test(n)) key = 'programacion';
  else { key = 'blanco'; notes.push('No he reconocido el tipo de pieza: empiezo desde un lienzo de marca.'); }
  if (key === 'story-hoy') format = 'story';

  const date = findDate(text, today);
  const time = findTime(text);
  const wantsPhoto = /foto|fotografia|imagen/.test(n);
  const leaveTime = /espacio para (el )?horario|hueco para (la )?hora|deja.*hora/.test(n);
  const dayName = date ? DAYS[date.getDay()] : null;
  const ddmm = date ? `${pad(date.getDate())}.${pad(date.getMonth() + 1)}` : null;
  const person = [...PEOPLE.comedians, ...PEOPLE.bands, ...PEOPLE.djs].find((p) => n.includes(norm(p)));
  const data = {};
  const PC = '[POR CONFIRMAR]';

  if (key === 'champions-partido') {
    const teams = findTeams(text);
    data.fecha = date ? `${dayName.toUpperCase()} ${ddmm}` : `[DÍA] ${PC}`;
    data.hora = time && !leaveTime ? `${time} H` : '[HORA] H';
    if (teams) { data.local = teams[0].toUpperCase(); data.visitante = teams[1].toUpperCase(); } else notes.push('No se indican los equipos: quedan como texto a rellenar.');
    data.competicion = /clasico/.test(n) ? 'EL CLÁSICO' : /liga/.test(n) ? 'LALIGA' : 'CHAMPIONS';
    if (/\bnormal|cualquier/.test(n)) notes.push('Recuerda: solo los partidos grandes llevan post; el resto, stories.');
  }
  if (key === 'monologos') {
    data.nombre = person && PEOPLE.comedians.includes(person) ? person.toUpperCase() : '[NOMBRE DEL HUMORISTA]';
    if (date) { data.fechaCorta = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`; data.dia = `${DAYS[date.getDay()].slice(0, 3).toUpperCase()} ${ddmm}`;
      data.subtitulo = `ESTE ${dayName.toUpperCase()} · ${date.getDate()} DE ${MONTHS[date.getMonth()].toUpperCase()} · ${time || '[HORA]'}`; }
    if (/sold ?out|agotad/.test(n)) data.soldout = 'SOLD OUT';
  }
  if (key === 'tardeo') {
    data.desde = time ? `DESDE LAS ${time}` : 'DESDE LAS [HORA]';
    if (date) data.fecha = `${DAYS[date.getDay()][0].toUpperCase() + DAYS[date.getDay()].slice(1)} ${date.getDate()} · ${MONTHS[date.getMonth()][0].toUpperCase() + MONTHS[date.getMonth()].slice(1)}`;
    data.etiqueta = /interior/.test(n) ? 'TARDEO INTERIOR' : 'TARDEO EXTERIOR';
  }
  if (key === 'story-hoy') { if (date) data.fecha = `${DAYS[date.getDay()].slice(0, 3).toUpperCase()} ${ddmm}`; if (person) data.filas = `${time || '[HORA]'} ${person}`; }
  if (key === 'programacion' && person) data.filas = `${date ? DAYS[date.getDay()].slice(0, 3).toUpperCase() + ' ' + date.getDate() : '[DÍA]'} · ${time || '[HORA]'} · ${person}`;
  if (leaveTime) notes.push('He dejado el horario como hueco «[HORA]» para completarlo.');
  if (wantsPhoto) notes.push('Pides una fotografía: elígela en el siguiente paso (se coloca en el hueco de foto de la plantilla).');
  if (!date && /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|hoy|manana)\b/.test(n) === false) notes.push('No se indica fecha.');
  return { key, format, data, wantsPhoto, date, time, notes };
}
