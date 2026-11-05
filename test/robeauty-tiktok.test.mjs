/* Section 4 of src/head.js: `window.rbTikTok.track`, the one place robeauty
 * TikTok events leave the browser.
 *
 *   pixel  -> ttq.identify (hashed e-mail / E.164 phone / external_id) +
 *             ttq.track with the caller's event_id
 *   server -> the VPS relay, only when asked, with the same event_id, explicit
 *             value / currency, order_id, ttclid and hashed external_id
 *   ttclid -> ?ttclid= saved first-party (cookie rb_ttclid + localStorage)
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

/* env: { href, cookie, localStorage: {k: v}, sessionStorage: {k: v} } */
const load = (env = {}) => {
  const calls = [];
  const requests = [];
  const cookieWrites = [];
  const jar = {};
  String(env.cookie ?? "_ttp=ttp-cookie; other=1")
    .split("; ")
    .filter(Boolean)
    .forEach((kv) => {
      const i = kv.indexOf("=");
      jar[kv.slice(0, i)] = kv.slice(i + 1);
    });
  const storage = (init) => {
    const store = { ...(init || {}) };
    return {
      store,
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => {
        store[k] = String(v);
      },
    };
  };
  const href = env.href || "https://robeauty.me/thanks";
  const url = new URL(href);
  const window = {
    location: { href, hostname: url.hostname, search: url.search },
    localStorage: storage(env.localStorage),
    sessionStorage: storage(env.sessionStorage),
  };
  const document = {
    get cookie() {
      return Object.entries(jar)
        .map(([k, v]) => k + "=" + v)
        .join("; ");
    },
    set cookie(raw) {
      cookieWrites.push(raw);
      const first = raw.split(";")[0];
      const i = first.indexOf("=");
      jar[first.slice(0, i)] = first.slice(i + 1);
    },
  };
  const context = {
    window,
    document,
    navigator: { userAgent: "UA" },
    crypto: webcrypto,
    TextEncoder,
    Promise,
    Uint8Array,
    Array,
    JSON,
    Date,
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
  return { window, calls, requests, cookieWrites, jar };
};

const run = async (event, data, opts, env) => {
  const t = load(env);
  await t.window.rbTikTok.track(event, data, opts);
  // Objects built inside the vm have the vm's prototypes; compare plain copies.
  return { ...t, calls: JSON.parse(JSON.stringify(t.calls)) };
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
    orderId: "T202610-123456789",
    user: {
      email: " Olha@Example.com ",
      phone: "+38 (067) 123-45-67",
      external_id: "0671234567",
    },
    server: true,
  });

  assert.deepEqual(calls[0], [
    "identify",
    {
      email: sha("olha@example.com"),
      phone_number: sha("+380671234567"),
      external_id: sha("0671234567"),
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
  assert.equal(body.user.external_id, sha("0671234567"));
  // The same numbers the pixel got, not a sum the relay has to rebuild.
  assert.equal(body.value, 900);
  assert.equal(body.currency, "UAH");
  assert.equal(body.order_id, "T202610-123456789");
  // No click id anywhere -> no ttclid keys at all.
  assert.equal("ttclid" in body, false);
  assert.equal("ttclid" in body.user, false);
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

test("relay value is the pixel value even when contents do not add up", async () => {
  // A cart discount: items 2 x 450, the customer pays 700.
  const { calls, requests } = await run(
    "InitiateCheckout",
    { ...cart, value: 700 },
    { eventId: "ic_1", server: true },
  );
  assert.equal(calls.at(-1)[2].value, 700);
  assert.equal(requests[0].body.value, 700);
  assert.equal("order_id" in requests[0].body, false);
});

test("external_id that already is a SHA-256 hex is sent unchanged", async () => {
  const hex = sha("0671234567");
  const { calls, requests } = await run("AddToCart", cart, {
    eventId: "atc_2",
    user: { external_id: hex.toUpperCase() },
    server: true,
  });
  assert.deepEqual(calls[0], ["identify", { external_id: hex }]);
  assert.equal(requests[0].body.user.external_id, hex);
});

test("?ttclid= is saved first-party for 28 days and rides on the relay", async () => {
  const t = load({
    href: "https://robeauty.me/lifting-cream?utm_campaign=CBO_TEST&ttclid=TESTCLID123",
    cookie: "_ttp=ttp-cookie",
  });
  assert.equal(t.cookieWrites.length, 1);
  const w = t.cookieWrites[0];
  assert.match(w, /^rb_ttclid=TESTCLID123;/);
  assert.match(w, /; max-age=2419200(;|$)/);
  assert.match(w, /; path=\/(;|$)/);
  assert.match(w, /; SameSite=Lax(;|$)/);
  assert.match(w, /; domain=\.robeauty\.me(;|$)/);
  const saved = JSON.parse(t.window.localStorage.store.rb_ttclid);
  assert.equal(saved.v, "TESTCLID123");
  assert.equal(t.window.rbTikTok.getTtclid(), "TESTCLID123");

  await t.window.rbTikTok.track("AddToCart", cart, {
    eventId: "atc_3",
    server: true,
  });
  assert.equal(t.requests[0].body.ttclid, "TESTCLID123");
  assert.equal(t.requests[0].body.user.ttclid, "TESTCLID123");
});

test("www host keeps the cookie on the registrable domain", () => {
  const t = load({ href: "https://www.robeauty.me/x?ttclid=A.B.C" });
  assert.match(t.cookieWrites[0], /; domain=\.robeauty\.me(;|$)/);
});

test("ttclid read order: rb_ttclid cookie, localStorage, pixel cookie, tt_adInfo", () => {
  const fresh = JSON.stringify({ v: "FROM_LS", ts: Date.now() });
  const old = JSON.stringify({ v: "OLD_LS", ts: Date.now() - 29 * 864e5 });
  const adInfo = JSON.stringify({ callback: "FROM_ADINFO", pixel_code: "X" });
  const get = (env) => load({ href: "https://robeauty.me/x", ...env }).window.rbTikTok.getTtclid();

  assert.equal(
    get({
      cookie: "rb_ttclid=FROM_RB; ttclid=FROM_PIXEL",
      localStorage: { rb_ttclid: fresh },
      sessionStorage: { tt_adInfo: adInfo },
    }),
    "FROM_RB",
  );
  assert.equal(
    get({
      cookie: "ttclid=FROM_PIXEL",
      localStorage: { rb_ttclid: fresh },
      sessionStorage: { tt_adInfo: adInfo },
    }),
    "FROM_LS",
  );
  assert.equal(
    get({
      cookie: "ttclid=FROM_PIXEL",
      localStorage: { rb_ttclid: old },
      sessionStorage: { tt_adInfo: adInfo },
    }),
    "FROM_PIXEL",
  );
  assert.equal(get({ cookie: "", sessionStorage: { tt_adInfo: adInfo } }), "FROM_ADINFO");
  assert.equal(get({ cookie: "", sessionStorage: { tt_adInfo: "{not json" } }), "");
});

test("ttclid passed by the caller (saved at checkout) wins over the stored one", async () => {
  const { requests } = await run(
    "Purchase",
    cart,
    { eventId: "p_1", ttclid: "AT_CHECKOUT", server: true },
    { cookie: "rb_ttclid=LATER_CLICK" },
  );
  assert.equal(requests[0].body.ttclid, "AT_CHECKOUT");
  assert.equal(requests[0].body.user.ttclid, "AT_CHECKOUT");
});
