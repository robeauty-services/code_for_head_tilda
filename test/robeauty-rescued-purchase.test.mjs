/* A rescued order (section 15) and the two releases it drives:
 *
 *   section 9  -> rbPaidGate.releaseHeldFor: pushes the held GA4 purchase
 *                 without asking the backend, once, for one order
 *   section 3  -> rbPaidGate.firePendingFor: sends the Meta/TikTok Purchase
 *                 held in rb_meta_pending, once, for one order
 *   section 15 -> the announcements on /payment-result, and the one question
 *                 to /payment-rescue/status after a paid retry invoice
 *
 * Each piece is cut out of src/head.js and run in node:vm with a fake window,
 * storage, fetch and timers. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const header = (text) => {
  const i = lines.findIndex((l) => l.startsWith("/* ===================== " + text));
  assert.ok(i > -1, "no header: " + text);
  return i;
};
const section = (from, to) =>
  lines.slice(header(from), to === null ? lines.length : header(to)).join("\n");

const NOW = 1_700_000_000_000;
const ORDER = "1158838403";
const REF = "2095616_" + ORDER;
const flush = async () => {
  for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
};

/* ===================== section 9: releaseHeldFor ===================== */

const gaPush = {
  event: "purchase",
  ecommerce: { purchase: { actionField: { id: ORDER, revenue: "1540" } } },
};

/* Runs section 9 with `store` as localStorage, with the page still loading so
 * nothing releases itself. Returns the gate and what reached dataLayer. */
const loadGate = ({ store = {} } = {}) => {
  const dataLayer = [];
  const window = { console, dataLayer, location: { href: "https://robeauty.me/payment-result" } };
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };
  const document = {
    readyState: "loading",
    addEventListener: () => {},
    querySelector: () => null,
  };
  vm.runInNewContext(section("9. Paid-only purchase events", "10. Bonus redemption"), {
    window, localStorage, document, console, JSON, String, Number, Object,
    parseInt, parseFloat, RegExp, Promise, Date: { now: () => NOW },
    setTimeout: () => 1, clearTimeout: () => {}, encodeURIComponent,
    fetch: () => Promise.reject(new Error("no request expected")),
  });
  return { gate: window.rbPaidGate, pushed: window.dataLayer, store };
};

const held = (over = {}) =>
  JSON.stringify(Object.assign({ id: ORDER, ts: NOW - 60_000, push: gaPush }, over));

test("section 9: releaseHeldFor pushes the held purchase once", () => {
  const { gate, pushed, store } = loadGate({ store: { rb_held_purchase: held() } });
  gate.releaseHeldFor(ORDER);
  assert.deepEqual(pushed, [gaPush]);
  assert.equal(store.rb_held_purchase, undefined);
  // Nothing is left to release, so a second call is a no-op.
  gate.releaseHeldFor(ORDER);
  assert.equal(pushed.length, 1);
});

test("section 9: releaseHeldFor matches the order, T-prefix and all", () => {
  let r = loadGate({ store: { rb_held_purchase: held({ id: "T202611-" + ORDER }) } });
  r.gate.releaseHeldFor(ORDER);
  assert.equal(r.pushed.length, 1);

  // Another order: the record stays where it is.
  r = loadGate({ store: { rb_held_purchase: held() } });
  r.gate.releaseHeldFor("2222222222");
  assert.equal(r.pushed.length, 0);
  assert.ok(r.store.rb_held_purchase);

  // Not an order number at all, and no record at all.
  r = loadGate({ store: { rb_held_purchase: held() } });
  r.gate.releaseHeldFor("");
  r.gate.releaseHeldFor("abc");
  assert.equal(r.pushed.length, 0);
  assert.equal(loadGate().gate.releaseHeldFor(ORDER), undefined);
});

test("section 9: a held record older than a day is dropped, not sent", () => {
  const { gate, pushed, store } = loadGate({
    store: { rb_held_purchase: held({ ts: NOW - 25 * 3600 * 1000 }) },
  });
  gate.releaseHeldFor(ORDER);
  assert.equal(pushed.length, 0);
  assert.equal(store.rb_held_purchase, undefined);
});

/* ===================== section 3: firePendingFor ===================== */

const cutFn = (first) => {
  const start = lines.findIndex((l) => l.startsWith(first));
  assert.ok(start > -1, "not found: " + first);
  const end = lines.findIndex((l, i) => i > start && l === "    };");
  return lines.slice(start, end + 1).join("\n");
};

/* The function alone, with a stub for the sender: the real one needs the whole
 * pixel. The stub clears the record exactly as `firePendingPurchase` does. */
const loadPending = ({ store = {} } = {}) => {
  const fired = [];
  const ctx = {
    window: {},
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      removeItem: (k) => { delete store[k]; },
    },
    firePendingPurchase: (data) => { fired.push(data); delete store.rb_meta_pending; },
    JSON, String, console,
  };
  vm.createContext(ctx);
  vm.runInContext(cutFn("    var firePendingFor = function (orderId) {"), ctx);
  return { firePendingFor: ctx.firePendingFor, fired, store };
};

const pending = (over = {}) =>
  JSON.stringify(Object.assign({ orderId: ORDER, eventId: ORDER + "_purchase", ts: NOW }, over));

test("section 3: firePendingFor sends the held Meta purchase once", () => {
  const r = loadPending({ store: { rb_meta_pending: pending() } });
  r.firePendingFor(ORDER);
  assert.equal(r.fired.length, 1);
  assert.equal(r.fired[0].eventId, ORDER + "_purchase");
  assert.equal(r.store.rb_meta_pending, undefined);
  r.firePendingFor(ORDER);
  assert.equal(r.fired.length, 1);
});

test("section 3: another order, a record without one, or none at all", () => {
  let r = loadPending({ store: { rb_meta_pending: pending() } });
  r.firePendingFor("2222222222");
  assert.equal(r.fired.length, 0);
  assert.ok(r.store.rb_meta_pending);

  r = loadPending({ store: { rb_meta_pending: pending({ orderId: "" }) } });
  r.firePendingFor("");
  r.firePendingFor(ORDER);
  assert.equal(r.fired.length, 0);

  r = loadPending({ store: { rb_meta_pending: "{not json" } });
  r.firePendingFor(ORDER);
  assert.equal(r.fired.length, 0);

  r = loadPending();
  r.firePendingFor(ORDER);
  assert.equal(r.fired.length, 0);
});

test("section 3: the gate is what gives section 15 access", () => {
  assert.match(source, /window\.rbPaidGate\.firePendingFor = firePendingFor;/);
});

/* ===================== section 15: rescued order ===================== */

const announcement = (event, ref = REF) => ({ event, order_ref: ref, value: 1540, currency: "UAH" });

/* `answer` is what /payment-rescue/status replies: [ok, body] or "neterr".
 * The gate is a stub that behaves like sections 9 and 3 together: it records
 * the call and clears the record of that order. */
const loadRescue = ({
  pathname = "/payment-result",
  store = {},
  dataLayer = [],
  answer = [true, { status: "pending" }],
  now = NOW,
} = {}) => {
  const releases = [];
  const requests = [];
  const orderOf = (key) => {
    try {
      const rec = JSON.parse(store[key] || "null");
      return rec ? String((key === "rb_held_purchase" ? rec.id : rec.orderId) || "") : "";
    } catch (e) {
      return "";
    }
  };
  const gate = {
    releaseHeldFor: (id) => {
      releases.push(["held", id]);
      if (orderOf("rb_held_purchase") === id) delete store.rb_held_purchase;
    },
    firePendingFor: (id) => {
      releases.push(["pending", id]);
      if (orderOf("rb_meta_pending") === id) delete store.rb_meta_pending;
    },
  };
  const window = { console, dataLayer, rbPaidGate: gate, location: { pathname } };
  const localStorage = { getItem: (k) => (k in store ? store[k] : null) };
  let ready = null;
  const document = {
    readyState: "loading",
    addEventListener: (name, fn) => { if (name === "DOMContentLoaded") ready = fn; },
  };
  const ticks = [];
  const fetch = (url) => {
    requests.push(url);
    if (answer === "neterr") return Promise.reject(new Error("net"));
    const [ok, body] = answer;
    return Promise.resolve({ ok, json: () => Promise.resolve(body) });
  };
  vm.runInNewContext(section("15. Rescued payment", null), {
    window, localStorage, document, fetch, console, JSON, String, Number, Object,
    parseInt, RegExp, Promise, encodeURIComponent, Date: { now: () => now },
    setInterval: (fn) => { ticks.push(fn); return ticks.length; },
    clearInterval: (id) => { ticks[id - 1] = null; },
    setTimeout: () => 1, clearTimeout: () => {},
    AbortController: function () { this.signal = {}; this.abort = () => {}; },
  });
  return {
    api: window.__rbRescue,
    releases,
    requests,
    store,
    dataLayer,
    ready: () => { assert.ok(ready, "no DOMContentLoaded listener"); ready(); },
    tick: () => ticks.forEach((fn) => fn && fn()),
    watching: () => ticks.some((fn) => !!fn),
  };
};

const both = () => ({
  rb_held_purchase: held(),
  rb_meta_pending: pending(),
});

test("section 15: cash on delivery releases GA4 and Meta once", () => {
  const r = loadRescue({ store: both() });
  r.ready();
  r.dataLayer.push(announcement("cod_switch_success"));
  r.tick();
  assert.deepEqual(r.releases, [["held", ORDER], ["pending", ORDER]]);
  assert.equal(r.store.rb_held_purchase, undefined);
  assert.equal(r.store.rb_meta_pending, undefined);

  // The block pushed the same announcement twice: nothing is left to release.
  r.dataLayer.push(announcement("cod_switch_success"));
  r.tick();
  assert.equal(r.releases.length, 2);
});

test("section 15: a paid retry on the page releases the same way", () => {
  const r = loadRescue({ store: both() });
  r.ready();
  r.dataLayer.push(announcement("payment_retry_success"));
  r.tick();
  assert.deepEqual(r.releases, [["held", ORDER], ["pending", ORDER]]);
});

test("section 15: an announcement pushed before the block looked is still caught", () => {
  const r = loadRescue({ store: both(), dataLayer: [announcement("cod_switch_success")] });
  r.ready();
  assert.equal(r.releases.length, 2);
});

test("section 15: somebody else's order, and other events, change nothing", () => {
  let r = loadRescue({ store: both() });
  r.ready();
  r.dataLayer.push(announcement("cod_switch_success", "2095616_2222222222"));
  r.dataLayer.push(announcement("cod_switch_success", ""));
  r.dataLayer.push({ event: "payment_retry_click", order_ref: REF });
  r.dataLayer.push({ ecommerce: { items: [] } });
  r.tick();
  assert.deepEqual(r.releases, []);
  assert.ok(r.store.rb_held_purchase);

  // Only the Meta record is on this device; both doors of the gate are still
  // knocked on, and section 9 answers for itself that it has nothing.
  r = loadRescue({ store: { rb_meta_pending: pending() } });
  r.ready();
  r.dataLayer.push(announcement("cod_switch_success"));
  r.tick();
  assert.deepEqual(r.releases, [["held", ORDER], ["pending", ORDER]]);
});

test("section 15: nothing held on this device means nothing happens at all", async () => {
  const r = loadRescue({
    store: { rb_pay_result: JSON.stringify({ ref: REF, result: "retry", ts: NOW - 60_000 }),
             rb_pay_link: JSON.stringify({ v: 1, ref: REF, order: ORDER, t: "tok", ts: NOW - 60_000 }) },
  });
  r.ready();
  r.dataLayer.push(announcement("cod_switch_success"));
  r.tick();
  await flush();
  assert.deepEqual(r.releases, []);
  assert.deepEqual(r.requests, []);
  assert.equal(r.watching(), false);
});

test("section 15: off /payment-result the announcements are not watched", () => {
  const r = loadRescue({ pathname: "/thanks", store: both() });
  r.ready();
  r.dataLayer.push(announcement("cod_switch_success"));
  r.tick();
  assert.equal(r.watching(), false);
  assert.deepEqual(r.releases, []);
});

/* ---------- the retry invoice paid at WayForPay (any page) ---------- */

const afterRetry = (over = {}) =>
  Object.assign(both(), {
    rb_pay_result: JSON.stringify({ ref: REF, result: "retry", ts: NOW - 5 * 60_000 }),
    rb_pay_link: JSON.stringify({ v: 1, ref: REF, order: ORDER, t: "Zm9vYmFyYmF6cXV1eA", ts: NOW - 20 * 60_000 }),
  }, over);

test("section 15: approved after a retry releases GA4 and Meta", async () => {
  const r = loadRescue({ pathname: "/", store: afterRetry(), answer: [true, { status: "approved" }] });
  r.ready();
  await flush();
  assert.deepEqual(r.requests, [
    "https://payment-handler.site/kommo_service/payment-rescue/status?ref=2095616_1158838403&t=Zm9vYmFyYmF6cXV1eA",
  ]);
  assert.deepEqual(r.releases, [["held", ORDER], ["pending", ORDER]]);
});

test("section 15: any other answer releases nothing", async () => {
  for (const answer of [
    [true, { status: "pending" }],
    [true, { status: "declined" }],
    [true, { status: "cod" }],
    [true, {}],
    [false, null],
    "neterr",
  ]) {
    const r = loadRescue({ pathname: "/", store: afterRetry(), answer });
    r.ready();
    await flush();
    assert.equal(r.requests.length, 1);
    assert.deepEqual(r.releases, [], JSON.stringify(answer));
    assert.ok(r.store.rb_held_purchase);
  }
});

test("section 15: without a usable marker nobody is asked anything", async () => {
  const cases = [
    { rb_pay_result: undefined },
    { rb_pay_result: JSON.stringify({ ref: REF, result: "cod", ts: NOW - 60_000 }) },
    { rb_pay_result: JSON.stringify({ ref: REF, result: "retry", ts: NOW - 25 * 3600 * 1000 }) },
    { rb_pay_result: JSON.stringify({ ref: REF, result: "retry", ts: NOW + 60_000 }) },
    { rb_pay_result: JSON.stringify({ ref: "2095616_2222222222", result: "retry", ts: NOW }) },
    { rb_pay_link: undefined },
    { rb_pay_link: JSON.stringify({ v: 1, ref: REF, order: ORDER, ts: NOW }) }, // no token
    { rb_pay_link: JSON.stringify({ v: 2, ref: REF, order: ORDER, t: "tok", ts: NOW }) },
  ];
  for (const over of cases) {
    const store = afterRetry();
    for (const key in over) {
      if (over[key] === undefined) delete store[key];
      else store[key] = over[key];
    }
    const r = loadRescue({ pathname: "/", store, answer: [true, { status: "approved" }] });
    r.ready();
    await flush();
    assert.deepEqual(r.requests, [], JSON.stringify(over));
    assert.deepEqual(r.releases, []);
  }
});

test("section 15: the pure parts", () => {
  const { api } = loadRescue({ store: both() });
  assert.equal(api.samePage("/payment-result"), true);
  assert.equal(api.samePage("/payment-result/"), true);
  assert.equal(api.samePage("/payment-results"), false);
  assert.equal(api.orderFromRef(REF), ORDER);
  assert.equal(api.orderFromRef("2095616_12345"), "");
  assert.equal(api.orderFromRef(null), "");
  assert.equal(api.hasRecordFor(ORDER), true);
  assert.equal(api.hasRecordFor("2222222222"), false);
  assert.equal(api.hasRecordFor(""), false);
});
