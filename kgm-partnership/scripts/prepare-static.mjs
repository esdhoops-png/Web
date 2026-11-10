// Post-processes the static export (out/) into a self-contained folder (static-site/)
// that works from any sub-path: relative asset URLs, inlined fonts, body-only index.
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const SRC = "out", DST = "static-site";
if (existsSync(DST)) rmSync(DST, { recursive: true });
cpSync(SRC, DST, { recursive: true });
// The host reserves top-level names starting with "_": serve Next assets from app/_next (matches assetPrefix "./app").
cpSync(join(DST, "_next"), join(DST, "app/_next"), { recursive: true });
rmSync(join(DST, "_next"), { recursive: true });
for (const f of readdirSync(DST)) if (f.startsWith("_") || f.endsWith(".txt")) rmSync(join(DST, f), { recursive: true, force: true });

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(DST);

// 1. Relative URLs for public assets.
for (const f of files.filter((f) => [".html", ".js", ".txt", ".css"].includes(extname(f)))) {
  let s = readFileSync(f, "utf8");
  const before = s;
  s = s.replace(/(["'(\\]+)\/(images|logos)\//g, "$1./$2/").replace(/(["'])\/icon\.svg/g, "$1./icon.svg");
  // Escape literal U+FFFD inside JS strings (the host rejects the raw character).
  if (f.endsWith(".js")) s = s.replace(/\uFFFD/g, "\\uFFFD");
  if (s !== before) writeFileSync(f, s);
}

// 2. Inline latin + latin-ext woff2 fonts into CSS, drop other subsets / woff fallbacks.
for (const f of files.filter((f) => f.endsWith(".css"))) {
  let css = readFileSync(f, "utf8");
  css = css.replace(/@font-face\s*{[^}]*}/g, (block) => {
    const m = block.match(/url\(\.\.\/media\/([^)]+?\.woff2)\)/);
    if (!m) return block;
    if (!/-(latin|latin-ext|wght-normal)[.-]/.test(m[1]) && !/inter-latin|serif-latin/.test(m[1])) return "";
    if (/cyrillic|greek|vietnamese/.test(m[1])) return "";
    const data = readFileSync(join(DST, "app/_next/static/media", m[1])).toString("base64");
    return block.replace(/src:[^;}]*/, `src:url(data:font/woff2;base64,${data}) format("woff2")`);
  });
  writeFileSync(f, css);
}

// 3. Index without document skeleton tags (the host adds them).
let html = readFileSync(join(DST, "index.html"), "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
writeFileSync(join(DST, "index.html"), head.replace(/<meta charSet="utf-8"\/>/, "").replace(/<meta name="viewport"[^>]*\/>/, "") + body);

// Drop files the static page does not need.
rmSync(join(DST, "404.html"), { force: true });
rmSync(join(DST, "app/_next/static/media"), { recursive: true, force: true });
const out = walk(DST);
console.log(`${out.length} files, ${(out.reduce((a, f) => a + statSync(f).size, 0) / 1e6).toFixed(1)} MB`);
