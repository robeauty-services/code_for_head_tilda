/* Section 5 of src/manera-head.js: what the cart form sends once Tilda says
 * it was submitted.
 *
 *   online payment  -> only checkout_context to manera-analytics, no Purchase
 *                      (paid orders reach Meta from the server, by webhook)
 *   cash / unknown  -> pixel Purchase + server copy with the same event_id
 *
 * The FB block (the first IIFE of the file) runs in node:vm against a minimal
 * fake DOM, so a change that drops the payment check fails here before a
 * release. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const CAPI_URL = "https://payment-handler.site/manera-analytics/api/fb/";
const USER_DATA_KEYS = [
  "city",
  "client_user_agent",
  "email",
  "fbc",
  "fbp",
  "first_name",
  "last_name",
  "phone",
];

const source = readFileSync(
  new URL("../src/manera-head.js", import.meta.url),
  "utf8",
);
const lines = source.split("\n");
const fbStart = lines.findIndex((l) => l.startsWith("(function () {"));
const fbEnd = lines.findIndex((l, i) => i > fbStart && l.startsWith("})();"));
const fbBlock = lines.slice(fbStart, fbEnd + 1).join("\n");

// Anything the block touches at load that the test does not care about.
const anything = (name) =>
  new Proxy(function () {}, {
    get: (t, k) =>
      k === "then" ? undefined : k === Symbol.toPrimitive ? () => "" : anything(name),
    apply: () => anything(name),
    construct: () => anything(name),
  });

const submitCartForm = (paymentSystem) => {
  const listeners = {};
  const requests = [];
  const pixel = [];
  const storage = new Map([
    ["rb_meta_pending", "1"],
    ["fb_capi_initial_checkout", "1"],
    [
      "tcart",
      JSON.stringify({
        orderid: "777",
        products: [
          { name: "Discovery Set [sku:00-00003638]", price: 290, quantity: 1, amount: 290 },
        ],
        amount: 290,
        total: 1,
        currency: "UAH",
      }),
    ],
  ]);
  const fields = {
    "[name=name]": { value: "Olena" },
    "[name=surname]": { value: "Petrenko" },
    "[name=city]": { value: "Kyiv" },
    "[type=email]": { value: "test@example.com" },
    "[type=tel]": { value: "+38 (067) 123-45-67" },
    '[name="paymentsystem"]:checked':
      paymentSystem === null ? null : { value: paymentSystem },
  };
  const form = {
    closest: (sel) => (sel === ".t706__orderform" ? {} : null),
    querySelector: (sel) => fields[sel] ?? null,
    dataset: {},
  };
  const document = new Proxy(
    {
      cookie: "_fbp=fb.1.111.222; _fbc=fb.1.333.abc",
      addEventListener: (type, cb) => (listeners[type] ||= []).push(cb),
      getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
      querySelector: () => null,
      querySelectorAll: () => [],
    },
    { get: (t, k) => (k in t ? t[k] : anything("document")) },
  );
  const localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  };
  const ctx = vm.createContext({
    document,
    localStorage,
    navigator: { userAgent: "UA-test" },
    location: { href: "https://maneraparfum.com/discovery", pathname: "/discovery", search: "" },
    dataLayer: [],
    crypto: { randomUUID: () => "uuid-1" },
    fetch: (url, opts) => {
      requests.push({ endpoint: url.slice(CAPI_URL.length), body: JSON.parse(opts.body) });
      return Promise.resolve({ ok: true });
    },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    addEventListener() {},
    setTimeout: () => 0,
    clearTimeout() {},
    setInterval: () => 0,
    clearInterval() {},
    console,
  });
  vm.runInContext("var window = this;", ctx);
  vm.runInContext(fbBlock, ctx);
  ctx.fbq.callMethod = (...args) => pixel.push(args);

  for (const cb of listeners["tildaform:aftersuccess"] || []) cb({ target: form });

  return {
    requests,
    pixelPurchases: pixel.filter((c) => c[0] === "track" && c[1] === "Purchase"),
    storage,
  };
};

test("online payment: only checkout_context goes to the server", () => {
  const { requests, pixelPurchases, storage } = submitCartForm("wayforpay");

  assert.deepEqual(requests.map((r) => r.endpoint), ["checkout_context"]);
  assert.equal(pixelPurchases.length, 0, "no pixel Purchase for an unpaid order");

  const body = requests[0].body;
  assert.equal(body.event_name, "CheckoutContext");
  assert.equal(body.action_source, "website");
  assert.equal(body.payment_system, "wayforpay");
  assert.equal(body.event_source_url, "https://maneraparfum.com/discovery");
  assert.ok(Number.isInteger(body.event_time));
  assert.equal(body.event_id, undefined);
  assert.deepEqual(Object.keys(body.user_data).sort(), USER_DATA_KEYS);
  assert.equal(body.user_data.fbp, "fb.1.111.222");
  assert.equal(body.user_data.fbc, "fb.1.333.abc");
  assert.equal(body.user_data.client_user_agent, "UA-test");
  assert.equal(body.user_data.phone, "+38 (067) 123-45-67");
  assert.equal(body.user_data.email, "test@example.com");

  assert.ok(!storage.has("rb_meta_pending"));
  assert.ok(!storage.has("fb_capi_initial_checkout"));
});

test("payment system is compared case-insensitively", () => {
  const { requests, pixelPurchases } = submitCartForm("WayForPay");
  assert.deepEqual(requests.map((r) => r.endpoint), ["checkout_context"]);
  assert.equal(requests[0].body.payment_system, "wayforpay");
  assert.equal(pixelPurchases.length, 0);
});

for (const [label, paymentSystem] of [
  ["cash", "cash"],
  ["unknown payment system", null],
]) {
  test(`${label}: pixel Purchase and server copy share the event_id`, () => {
    const { requests, pixelPurchases, storage } = submitCartForm(paymentSystem);

    assert.deepEqual(requests.map((r) => r.endpoint), ["purchase"]);
    const body = requests[0].body;
    assert.equal(body.event_name, "Purchase");
    assert.equal(body.event_id, "777_purchase");
    assert.deepEqual(Object.keys(body.user_data).sort(), USER_DATA_KEYS);
    assert.equal(body.cart.orderid, "777");

    assert.equal(pixelPurchases.length, 1);
    assert.equal(pixelPurchases[0][3].eventID, "777_purchase");
    // Discovery Set [sku:00-00003638] -> its id in map_content_ids.
    assert.deepEqual([...pixelPurchases[0][2].content_ids], ["817166850954"]);

    assert.ok(!storage.has("rb_meta_pending"));
    assert.ok(!storage.has("fb_capi_initial_checkout"));
  });
}
