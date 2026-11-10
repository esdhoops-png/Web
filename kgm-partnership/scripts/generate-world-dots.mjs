// Generates a dotted world map (land points) used by the Global Reach section.
// Run with: npm run gen:map  — output: src/data/world-dots.json
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains, geoEquirectangular } from "d3-geo";

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(topo, topo.objects.land);

const W = 1000, H = 460, STEP = 9;
const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2 + 40]);

const dots = [];
for (let y = 0; y <= H; y += STEP) {
  for (let x = 0; x <= W; x += STEP) {
    const ll = projection.invert([x, y]);
    if (!ll || ll[1] < -58) continue; // skip Antarctica
    if (geoContains(land, ll)) dots.push([x, y]);
  }
}

const project = (lon, lat) => projection([lon, lat]).map((v) => Math.round(v));
const out = {
  width: W, height: H, step: STEP, dots,
  // Region anchor points (approximate centres, for illustration only)
  anchors: {
    northAmerica: project(-98, 39),
    europe: project(10, 49),
    asia: project(110, 33),
  },
};
writeFileSync(new URL("../src/data/world-dots.json", import.meta.url), JSON.stringify(out));
console.log(`dots: ${dots.length}`, out.anchors);
