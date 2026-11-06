/* GA4 cart funnel fixes in src/head.js (06.11.2026):
 *
 *   getGaSessionId          -> session_id from the _ga_GNEFTDXVHT cookie, both
 *                              GS1 and GS2 formats; server events carry it so
 *                              GA4 ties them to the session
 *   sendToGoogle            -> adds session_id + engagement_time_msec to every
 *                              event, never overwrites one already set
 *   checkoutAlreadyStarted  -> the begin_checkout flag lives 30 minutes; the
 *                              legacy "true" value counts as expired
 *
 * Pieces are cut out of the file by their first lines and run in node:vm.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const cut = (first, last) => {
  const start = lines.findIndex((l) => l.startsWith(first));
  assert.ok(start > -1, `not found: ${first}`);
  const end = lines.findIndex((l, i) => i > start && l === last);
  return lines.slice(start, end + 1).join("\n");
};

const sessionSrc = cut("  var getGaSessionId = () => {", "  };");
const sendSrc = cut("  var sendToGoogle = (endpoint, payload) => {", "  };");
const ttlLine = lines.find((l) => l.startsWith("    var CHECKOUT_FLAG_TTL_MS = "));
assert.ok(ttlLine, "CHECKOUT_FLAG_TTL_MS not found");
const flagSrc = ttlLine + "\n" + cut("    var checkoutAlreadyStarted = () => {", "    };");

const run = (code, ctx) => {
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx;
};

const withCookie = (value) =>
  run(sessionSrc + "\n" + sendSrc, {
    getCookie: (name) => (name === "_ga_GNEFTDXVHT" ? value : null),
    GOOGLE_URL: "https://x/",
    sent: [],
    fetch(url, opts) {
      this.sent.push(JSON.parse(opts.body));
      return { catch() {} };
    },
    console,
  });

test("session_id from a GS1 cookie", () => {
  const ctx = withCookie("GS1.1.1793766829.5.1.1793767000.0.0.0");
  assert.equal(ctx.getGaSessionId(), "1793766829");
});

test("session_id from a GS2 cookie", () => {
  const ctx = withCookie("GS2.1.s1793766829$o5$g1$t1793767000$j60$l0$h0");
  assert.equal(ctx.getGaSessionId(), "1793766829");
});

test("no cookie or garbage gives null", () => {
  assert.equal(withCookie(null).getGaSessionId(), null);
  assert.equal(withCookie("garbage").getGaSessionId(), null);
  assert.equal(withCookie("GS2.1.o5$g1").getGaSessionId(), null);
});

test("sendToGoogle adds session_id without overwriting", () => {
  const ctx = withCookie("GS1.1.1793766829.5.1.1793767000.0.0.0");
  ctx.fetch = ctx.fetch.bind(ctx);
  ctx.sendToGoogle("view_cart", {
    events: [{ name: "view_cart", params: { value: 1 } }, { name: "x", params: { session_id: "7" } }],
  });
  const [body] = ctx.sent;
  assert.equal(body.events[0].params.session_id, "1793766829");
  assert.equal(body.events[0].params.engagement_time_msec, 1);
  assert.equal(body.events[1].params.session_id, "7");
});

test("sendToGoogle without the cookie sends params untouched", () => {
  const ctx = withCookie(null);
  ctx.fetch = ctx.fetch.bind(ctx);
  ctx.sendToGoogle("view_cart", { events: [{ name: "view_cart", params: { value: 1 } }] });
  assert.deepEqual(Object.keys(ctx.sent[0].events[0].params), ["value"]);
});

test("begin_checkout flag expires after 30 minutes; legacy 'true' is expired", () => {
  const store = {};
  const ctx = run(flagSrc, {
    localStorage: { getItem: (k) => (k in store ? store[k] : null) },
    Date,
  });
  assert.equal(ctx.checkoutAlreadyStarted(), false);
  store.fb_capi_initial_checkout = "true";
  assert.equal(ctx.checkoutAlreadyStarted(), false);
  store.fb_capi_initial_checkout = String(Date.now() - 5 * 60 * 1000);
  assert.equal(ctx.checkoutAlreadyStarted(), true);
  store.fb_capi_initial_checkout = String(Date.now() - 31 * 60 * 1000);
  assert.equal(ctx.checkoutAlreadyStarted(), false);
});
