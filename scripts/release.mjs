#!/usr/bin/env node
/* One command per site to cut a release.
 *
 * A release is two phases with a human merge between them, because the tag has
 * to point at the commit on main that carries the rebuilt bundle — that commit
 * is what jsDelivr serves, forever, at an immutable URL.
 *
 *   npm run release:manera 1.0.1   phase 1: build, repin, commit, push, open PR
 *   npm run release:manera         phase 2 (after the merge): tag main, push it
 *   npm run pins                   read-only: what each site is pinned to
 *
 * Phase 2 refuses to run unless main is clean, synced, carries the pin it is
 * about to tag, and its committed dist/ matches a fresh build. Those four
 * checks are the whole point: they make "tagged a stale bundle" unrepresentable.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SITES = {
  robeauty: {
    build: "build:robeauty",
    head: "tilda_head_without_scripts/tilda_head.html",
    bundle: "dist/head.min.js",
    tilda: "robeauty.me — Tilda project 2095616",
  },
  manera: {
    build: "build:manera",
    head: "tilda_head_without_scripts/manera_head.html",
    bundle: "dist/manera.min.js",
    tilda: "maneraparfum.com — Tilda project 9787525",
  },
  pl: {
    build: "build:pl",
    head: "tilda_head_without_scripts/tilda_pl_head.html",
    bundle: "dist/pl.min.js",
    tilda: "pl.robeauty.me — Tilda project 6512256",
  },
};

const REPO = "robeauty-services/code_for_head_tilda";
const CDN = "https://cdn.jsdelivr.net/gh/" + REPO;

const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
const run = (...a) => execFileSync(a[0], a.slice(1), { stdio: "inherit" });
const quiet = (...a) => {
  try {
    return execFileSync(a[0], a.slice(1), { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
};
const die = (msg) => {
  console.error("\n✗ " + msg + "\n");
  process.exit(1);
};

// The pin, and only the pin: growthbook is also served from jsDelivr.
const pinRe = (bundle) =>
  new RegExp(`(cdn\\.jsdelivr\\.net/gh/${REPO}@)([^/]+)(/${bundle})`, "g");

const readPin = (site) => {
  const hits = [...readFileSync(site.head, "utf8").matchAll(pinRe(site.bundle))];
  if (hits.length !== 1) {
    die(`${site.head}: expected exactly 1 pin for ${site.bundle}, found ${hits.length}`);
  }
  return hits[0][2];
};

const distIsStale = (site) => {
  run("npm", "run", site.build);
  return git("status", "--porcelain", "--", site.bundle) !== "";
};

/* ---------- read-only listing ---------- */

if (process.argv[2] === "--list") {
  for (const [name, site] of Object.entries(SITES)) {
    const pin = readPin(site);
    const tagged = quiet("git", "rev-parse", "-q", "--verify", `refs/tags/${pin}`) ? "tagged" : "NOT TAGGED";
    console.log(`${name.padEnd(9)} ${pin.padEnd(16)} ${tagged.padEnd(11)} ${site.tilda}`);
  }
  console.log("\nnothing was changed. to release:  npm run release:<site> <version>");
  process.exit(0);
}

const [, , name, version] = process.argv;
const site = SITES[name];
if (!site) die(`unknown site "${name ?? ""}" — expected one of: ${Object.keys(SITES).join(", ")}`);

/* ---------- phase 2: tag an already-merged release ---------- */

if (!version) {
  const tag = readPin(site);
  console.log(`no version given — tagging the release already merged for ${name}: ${tag}\n`);

  if (git("rev-parse", "--abbrev-ref", "HEAD") !== "main") die("not on main. the tag must point at the merged commit: git checkout main && git pull");
  if (git("status", "--porcelain") !== "") die("working tree is dirty. commit or stash first — the tag would capture whatever is on disk.");

  run("git", "fetch", "--quiet", "origin", "main", "--tags");
  if (git("rev-parse", "HEAD") !== git("rev-parse", "origin/main")) die("main is not in sync with origin/main. git pull first.");
  if (quiet("git", "rev-parse", "-q", "--verify", `refs/tags/${tag}`)) {
    die(`tag ${tag} already exists. jsDelivr caches tags forever, so never move one — bump to a new version instead.`);
  }
  if (distIsStale(site)) die(`${site.bundle} on main does not match a fresh build of the source. the tag would serve stale code.`);

  run("git", "tag", "-m", `${tag}: ${site.tilda}`, tag);
  run("git", "push", "--quiet", "origin", tag);

  console.log(`
✓ tagged and pushed ${tag}

  ${CDN}@${tag}/${site.bundle}

last step — paste ${site.head}
into ${site.tilda}
  Site settings -> More -> HEAD code

nothing changes for visitors until you do.
`);
  process.exit(0);
}

/* ---------- phase 1: build, repin, commit, PR ---------- */

if (!/^\d+\.\d+\.\d+$/.test(version)) die(`version must look like 1.0.1, got "${version}"`);

const tag = `${name}-v${version}`;
const was = readPin(site);
if (was === tag) die(`${site.head} is already pinned to ${tag}`);
if (quiet("git", "rev-parse", "-q", "--verify", `refs/tags/${tag}`)) die(`tag ${tag} already exists — pick a new version`);
if (git("status", "--porcelain") !== "") die("working tree is dirty. commit or stash your other changes first.");

// Build before repinning: a pin bump that ships a stale bundle is the failure
// this script exists to prevent.
run("npm", "run", site.build);

const branch = `release/${tag}`;
run("git", "checkout", "--quiet", "-b", branch);
writeFileSync(site.head, readFileSync(site.head, "utf8").replace(pinRe(site.bundle), `$1${tag}$3`));
run("git", "add", site.bundle, site.head);
run("git", "commit", "--quiet", "-m", `release(${name}): ${tag}`);
run("git", "push", "--quiet", "-u", "origin", branch);

const body = `Pins ${site.tilda} to \`${tag}\` (was \`${was}\`) and rebuilds \`${site.bundle}\` from source.

After merge, run \`npm run release:${name}\` on main to create and push the tag, then paste \`${site.head}\` into Tilda.`;

let pr = quiet("gh", "pr", "create", "--base", "main", "--head", branch, "--title", `release(${name}): ${tag}`, "--body", body);
if (pr) pr = pr.split("\n").pop();

console.log(`
✓ ${was} -> ${tag}, committed on ${branch}
${pr ? "✓ opened " + pr : "! could not open a PR automatically — open one for " + branch}

next:
  merge that PR, then:
    git checkout main && git pull
    npm run release:${name}      # tags ${tag} and pushes it
`);
