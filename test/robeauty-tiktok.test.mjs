/* Section 4 of src/head.js: `window.rbTikTok.track`, the one place robeauty
 * TikTok events leave the browser.
 *
 *   pixel  -> ttq.identify (hashed e-mail / E.164 phone) + ttq.track with the
 *             caller's event_id
 *   server -> the VPS relay, only when asked, with the same event_id and the
 *             fields the relay reads (it sums value from contents)
 *
 * The block (the IIFE right after the TikTok loader) runs in node:vm with a
 * fake ttq and fetch. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash, webcrypto } from "node:crypto";
import vm from "node:vm";

const RELAY_URL =
  "https://payment-handler.site/webhooks/tiktok_capi/tt_capi.php";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const loaderEnd = lines.findIndex((l) => l === '})(window, document, "ttq");');
const start = lines.findIndex((l, i) => i > loaderEnd && l === "(function () {");
const end = lines.findIndex((l, i) => i > start && l === "})();");
const block = lines.slice(start, end + 1).join("\n");

const sha = (s) => createHash("sha256").update(s).digest("hex");

const run = async (event, data, opts) => {
  const calls = [];
  const requests = [];
  const window = {
    location: { href: "https://robeauty.me/thanks" },
  };
  const context = {
    window,
    document: { cookie: "_ttp=ttp-cookie; other=1" },
    navigator: { userAgent: "UA" },
    crypto: webcrypto,
    TextEncoder,
    Promise,
    Uint8Array,
    Array,
    console,
    ttq: {
      identify: (x) => calls.push(["identify", x]),
      track: (...a) => calls.push(["track", ...a]),
    },
    fetch: (url, init) => {
      requests.push({ url, body: JSON.parse(init.body) });
      return Promise.resolve({});
    },
  };
  window.crypto = webcrypto;
  vm.runInNewContext(block, context);
  await window.rbTikTok.track(event, data, opts);
  // Objects built inside the vm have the vm's prototypes; compare plain copies.
  return { calls: JSON.parse(JSON.stringify(calls)), requests };
};

const cart = {
  contents: [
    { content_id: "556889836181", content_name: "Serum", price: 450, quantity: 2 },
  ],
  value: 900,
  currency: "UAH",
};

test("Purchase: pixel and relay share the event_id, user is hashed", async () => {
  const { calls, requests } = await run("Purchase", cart, {
    eventId: "T202610-123456789_purchase",
    eventTime: 1761480000,
    user: { email: " Olha@Example.com ", phone: "+38 (067) 123-45-67" },
    server: true,
  });

  assert.deepEqual(calls[0], [
    "identify",
    {
      email: sha("olha@example.com"),
      phone_number: sha("+380671234567"),
    },
  ]);
  const [, name, props, options] = calls[1];
  assert.equal(name, "Purchase");
  assert.equal(options.event_id, "T202610-123456789_purchase");
  assert.equal(props.value, 900);
  assert.equal(props.currency, "UAH");
  assert.equal(props.content_type, "product");

  assert.equal(requests.length, 1);
  const { url, body } = requests[0];
  assert.equal(url, RELAY_URL);
  assert.equal(body.event, "Purchase");
  assert.equal(body.event_id, "T202610-123456789_purchase");
  assert.equal(body.event_time, 1761480000);
  assert.equal(body.user.email, sha("olha@example.com"));
  assert.equal(body.user.phone, sha("+380671234567"));
  assert.equal(body.user.ttp, "ttp-cookie");
  assert.deepEqual(body.contents, [
    {
      content_id: "556889836181",
      content_name: "Serum",
      price: 450,
      quantity: 2,
      currency: "UAH",
    },
  ]);
});

test("local phone format 0XXXXXXXXX becomes +380…", async () => {
  const { calls } = await run("AddToCart", cart, {
    eventId: "atc_1",
    user: { phone: "0671234567" },
  });
  assert.deepEqual(calls[0], [
    "identify",
    { phone_number: sha("+380671234567") },
  ]);
});

test("ViewContent without `server` stays in the browser", async () => {
  const { calls, requests } = await run("ViewContent", cart, { eventId: "vc_1" });
  assert.equal(requests.length, 0);
  // No contact data -> no identify, straight to track.
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], "ViewContent");
  assert.equal(calls[0][3].event_id, "vc_1");
});
