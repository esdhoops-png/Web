// Packs a prepared static folder (see prepare-static.mjs) into ONE self-contained HTML file:
// CSS, scripts, fonts and images are inlined, so the file opens offline with a double click.
// Usage: node scripts/single-file.mjs <static-dir> <out.html>
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const [dir, out] = process.argv.slice(2);
const mime = { ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
const dataUri = (rel) => {
  const f = join(dir, rel.replace(/^\.\//, ""));
  return `data:${mime[extname(f)]};base64,${readFileSync(f).toString("base64")}`;
};

let html = readFileSync(join(dir, "index.html"), "utf8");

// Preloads point at files that will no longer exist.
html = html.replace(/<link rel="preload"[^>]*>/g, "").replace(/<link rel="preconnect"[^>]*>/g, "");

// Stylesheet -> data: URI, replaced everywhere (React looks the same href up again when it hydrates).
const cssRefs = [...new Set([...html.matchAll(/\.\/app\/[^"\\]+\.css/g)].map((m) => m[0]))];
const cssUris = new Map(cssRefs.map((ref) => [ref, `data:text/css;base64,${readFileSync(join(dir, ref.replace(/^\.\//, ""))).toString("base64")}`]));

// Scripts -> inline, in the same order. The Turbopack runtime identifies each chunk by its
// script "src"; inline scripts have none, so the path is kept in data-src and the runtime is
// patched to read it from there.
html = html.replace(/<script src="(\.\/app\/[^"]+\.js)"[^>]*><\/script>/g, (_, src) => {
  let js = readFileSync(join(dir, src.replace(/^\.\//, "")), "utf8");
  js = js.split('{src:e.getAttribute("src")}').join('{src:e.getAttribute("src")||e.getAttribute("data-src")}');
  return `<script data-src="${src}">${js.replace(/<\/script/gi, "<\\/script")}</script>`;
});

// Images, logos and icon -> data URIs (in markup, inline scripts and serialized data alike).
const cache = new Map();
html = html.replace(/\.\/(?:images|logos)\/[A-Za-z0-9._-]+\.(?:webp|jpg|png|svg)|\.\/icon\.svg/g, (m) => {
  if (!cache.has(m)) cache.set(m, dataUri(m));
  return cache.get(m);
});

// React re-inserts <script async src> tags for chunks that are already inline: point them at a no-op.
html = html.replace(/(\\"src\\":\\")\.\/app\/[^"\\]*?([A-Za-z0-9_-]+)\.js(\\")/g, (_, a, name, z) => `${a}data:text/javascript,//${name}${z}`);

for (const [ref, uri] of cssUris) html = html.split(ref).join(uri);

const doc = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
</head>
<body>
${html}
</body>
</html>
`;
writeFileSync(out, doc);
console.log(out, (statSync(out).size / 1e6).toFixed(1) + " MB", "left-over refs:", (doc.match(/"\.\/(app|images|logos)\//g) || []).length);
