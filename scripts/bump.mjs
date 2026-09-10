#!/usr/bin/env node
/* Rebuilds one site's bundle and repins its head snippet to a new tag.
 *
 * The jsDelivr URL in tilda_head_without_scripts/*.html is the one thing git
 * cannot verify — it points at a tag that does not exist yet at PR time, and
 * once pasted into Tilda it is the only thing that decides what visitors run.
 * It has drifted before (the file claimed v1.0.3 while robeauty.me served
 * v1.0.6), so bump it from here instead of by hand.
 *
 *   node scripts/bump.mjs                  # show what each site is pinned to
 *   node scripts/bump.mjs manera 1.0.1     # rebuild + repin to manera-v1.0.1
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SITES = {
  robeauty: {
    script: "build:robeauty",
    head: "tilda_head_without_scripts/tilda_head.html",
    bundle: "dist/head.min.js",
    tilda: "robeauty.me (Tilda 2095616)",
  },
  manera: {
    script: "build:manera",
    head: "tilda_head_without_scripts/manera_head.html",
    bundle: "dist/manera.min.js",
    tilda: "maneraparfum.com (Tilda 9787525)",
  },
};

const REPO = "robeauty-services/code_for_head_tilda";
// The pin, and only the pin: the growthbook <script> is also a jsDelivr URL.
const pinRe = (bundle) =>
  new RegExp(`(cdn\\.jsdelivr\\.net/gh/${REPO}@)([^/]+)(/${bundle})`, "g");

const currentPin = (site) => {
  const html = readFileSync(site.head, "utf8");
  const hits = [...html.matchAll(pinRe(site.bundle))];
  if (hits.length !== 1) {
    throw new Error(
      `${site.head}: expected exactly 1 pin for ${site.bundle}, found ${hits.length}`,
    );
  }
  return hits[0][2];
};

const [name, version] = process.argv.slice(2);

if (!name) {
  for (const [key, site] of Object.entries(SITES)) {
    console.log(`${key.padEnd(9)} ${currentPin(site)}  -> ${site.tilda}`);
  }
  console.log("\nusage: node scripts/bump.mjs <site> <version>   e.g. manera 1.0.1");
  process.exit(0);
}

const site = SITES[name];
if (!site) {
  console.error(`unknown site "${name}" — expected one of: ${Object.keys(SITES).join(", ")}`);
  process.exit(1);
}
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
  console.error(`version must look like 1.0.1, got "${version ?? ""}"`);
  process.exit(1);
}

const tag = `${name}-v${version}`;
const was = currentPin(site);
if (was === tag) {
  console.error(`${site.head} is already pinned to ${tag} — nothing to do`);
  process.exit(1);
}

// Rebuild first: a pin bump that ships a stale bundle is the failure this
// script exists to prevent.
execFileSync("npm", ["run", site.script], { stdio: "inherit" });

const html = readFileSync(site.head, "utf8");
writeFileSync(site.head, html.replace(pinRe(site.bundle), `$1${tag}$3`));

console.log(`
${site.head}
  ${was} -> ${tag}

next:
  git add ${site.bundle} ${site.head} && git commit -m "release(${name}): ${tag}"
  # PR -> squash-merge, then on main:
  git tag ${tag} && git push origin ${tag}
  # then paste ${site.head} into ${site.tilda}
  #   Site settings -> More -> HEAD code
`);
