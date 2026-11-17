/* Section 3 of src/head.js: what an order sends to Meta and TikTok.
 *
 *   upsell on /thanks -> its own "Upsell" event (Meta trackCustom, TikTok
 *                        custom), browser only; never a Purchase and never
 *                        written to rb_meta_pending, so a main order waiting
 *                        there for its payment check is left alone
 *   main order        -> rb_meta_pending, then on /thanks one Purchase to the
 *                        pixel, the server copy and TikTok, all with the same
 *                        event_id and the same value: goods after the promo
 *                        code / bonuses / store discounts, not before them
 *
 * Section 3 (the whole Meta IIFE) runs in node:vm against a minimal fake DOM,
 * as in manera-purchase.test.mjs. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const CAPI_URL = "https://payment-handler.site/fb_capi_service/api/fb/";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const header = (text) => {
  const i = lines.findIndex((l) => l.startsWith("/* ===================== " + text));
  assert.ok(i > -1, "no header: " + text);
  return i;
};
const section3 = lines
  .slice(header("3. Facebook Pixel + CAPI"), header("4. TikTok Pixel"))
  .join("\n");

// Anything the block touches that the test does not care about.
const anything = () =>
  new Proxy(function () {}, {
    get: (t, k) =>
      k === "then" ? undefined : k === Symbol.toPrimitive ? () => "" : anything(),
    apply: () => anything(),
    construct: () => anything(),
  });

const MAIN_ORDER = "T202611-1111111111";
const UPSELL_ORDER = "T202611-2222222222";

// A Tilda cart as it sits in localStorage: full prices in the lines and in
// prodamount, the promo code and the totals Tilda computed from it.
const promoCart = () => ({
  orderid: "777",
  products: [
    { name: "Сироватка [sku:00-00000114]", sku: "00-00000114", price: 790, quantity: 1, amount: 790 },
    { name: "Крем [sku:00-00000024]", sku: "00-00000024", price: 1210, quantity: 1, amount: 1210 },
  ],
  prodamount: 2000,
  promocode: { promocode: "AUTUMN10", discountpercent: 10 },
  prodamount_discountsum: 200,
  prodamount_withdiscount: 1800,
  amount: 1800,
  total: 2,
  currency: "UAH",
});

const upsellCart = () => ({
  orderid: "888",
  products: [{ name: "SPF [sku:00-00000026]", sku: "00-00000026", price: 499, quantity: 1, amount: 499 }],
  prodamount: 499,
  amount: 499,
  total: 1,
  currency: "UAH",
});

/* Loads section 3 at `path`. Returns the listeners it registered and what
 * left the browser: pixel calls, server requests, TikTok calls. */
const load = ({ path = "/products", store = {}, dataLayer = [], liveCart } = {}) => {
  const listeners = {};
  const requests = [];
  const pixel = [];
  const tiktok = [];
  const storage = new Map(Object.entries(store));
  const document = new Proxy(
    {
      cookie: "_fbp=fb.1.111.222; _fbc=fb.1.333.abc",
      addEventListener: (type, cb) => (listeners[type] ||= []).push(cb),
      removeEventListener() {},
      getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
      createElement: () => ({}),
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      body: { classList: { contains: () => false } },
    },
    { get: (t, k) => (k in t ? t[k] : anything()) },
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
    location: { href: "https://robeauty.me" + path, pathname: path, search: "" },
    dataLayer,
    crypto: { randomUUID: () => "uuid-1" },
    fetch: (url, opts) => {
      requests.push({ endpoint: String(url).replace(CAPI_URL, ""), body: JSON.parse(opts.body) });
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
  if (liveCart) ctx.tcart = liveCart;
  ctx.rbTikTok = {
    track: (event, data, opts) => tiktok.push({ event, data, opts }),
    getTtclid: () => "",
  };
  vm.runInContext(section3, ctx);
  ctx.fbq.callMethod = (...args) => pixel.push(args);
  return { ctx, listeners, requests, pixel, tiktok, storage };
};

const cartForm = (id, payment = "cash") => {
  const fields = {
    "[name=name]": { value: "тест" },
    "[name=surname]": { value: "тест" },
    "[name=city]": { value: "Київ" },
    "[type=email]": { value: "test@example.com" },
    "[type=tel]": { value: "+380 (11) 111-11-01" },
    '[name="paymentsystem"]:checked': { value: payment },
  };
  return {
    id,
    closest: (sel) => (sel === ".t706__orderform" ? {} : null),
    querySelector: (sel) => fields[sel] ?? null,
    dataset: {},
  };
};

const submit = (r, form) => {
  for (const cb of r.listeners["tildaform:aftersuccess"] || []) cb({ target: form });
};
const purchases = (r) => r.pixel.filter((c) => c[0] === "track" && c[1] === "Purchase");

test("upsell on /thanks: an Upsell event, no Purchase, nothing pending", () => {
  const r = load({
    path: "/thanks",
    store: { tcart: JSON.stringify(upsellCart()), fb_capi_initial_checkout: "1" },
    dataLayer: [{ event: "purchase", ecommerce: { purchase: { actionField: { id: UPSELL_ORDER } } } }],
  });
  submit(r, cartForm("form2235408313"));

  assert.equal(r.storage.has("rb_meta_pending"), false, "the upsell must not wait for a Purchase");
  assert.equal(r.storage.has("fb_capi_initial_checkout"), false);
  assert.equal(purchases(r).length, 0);
  assert.equal(r.requests.filter((q) => q.endpoint === "purchase").length, 0);

  const custom = r.pixel.filter((c) => c[0] === "trackCustom");
  assert.equal(custom.length, 1);
  assert.equal(custom[0][1], "Upsell");
  assert.equal(custom[0][2].value, 499);
  assert.equal(custom[0][2].payment, "cash");
  assert.equal(custom[0][3].eventID, UPSELL_ORDER + "_upsell");

  assert.equal(r.tiktok.length, 1);
  assert.equal(r.tiktok[0].event, "Upsell");
  assert.equal(r.tiktok[0].data.value, 499);
  assert.equal(r.tiktok[0].opts.eventId, UPSELL_ORDER + "_upsell");
  assert.equal(r.tiktok[0].opts.server, false, "no relay copy for the upsell");
});

test("upsell does not overwrite a main order still waiting for its payment check", () => {
  const waiting = JSON.stringify({ orderId: MAIN_ORDER, eventId: MAIN_ORDER + "_purchase", payment: "wayforpay", ts: 1 });
  const r = load({
    path: "/thanks",
    store: { tcart: JSON.stringify(upsellCart()), rb_meta_pending: waiting },
    dataLayer: [{ ecommerce: { purchase: { actionField: { id: UPSELL_ORDER } } } }],
  });
  submit(r, cartForm("form2235408313", "wayforpay"));
  assert.equal(r.storage.get("rb_meta_pending"), waiting);
  assert.equal(r.pixel.find((c) => c[0] === "trackCustom")[2].payment, "wayforpay");
});

test("any cart order on a thanks page is the upsell, even if the form id changes", () => {
  for (const path of ["/thanks", "/thx-claude", "/thanks1"]) {
    const r = load({ path, store: { tcart: JSON.stringify(upsellCart()) } });
    submit(r, cartForm("form9999999999"));
    assert.equal(r.storage.has("rb_meta_pending"), false, path);
    assert.equal(r.pixel.filter((c) => c[1] === "Upsell").length, 1, path);
  }
});

test("main cart order: one pending Purchase, value after the promo code", () => {
  const r = load({
    path: "/products",
    store: { tcart: JSON.stringify(promoCart()), fb_capi_initial_checkout: "1" },
    dataLayer: [{ event: "purchase", ecommerce: { purchase: { actionField: { id: MAIN_ORDER } } } }],
  });
  submit(r, cartForm("form665507684"));
  assert.equal(r.pixel.filter((c) => c[0] === "trackCustom").length, 0);
  assert.equal(r.tiktok.length, 0, "nothing leaves the browser before /thanks");
  const pending = JSON.parse(r.storage.get("rb_meta_pending"));
  assert.equal(pending.eventId, MAIN_ORDER + "_purchase");
  assert.equal(pending.orderId, MAIN_ORDER);
  assert.equal(r.storage.has("fb_capi_initial_checkout"), false);
});

test("the live cart wins: a ?promo= code that only window.tcart knows", () => {
  // As seen on robeauty.me 17.11.2026: the promo link put CART5 into
  // window.tcart, localStorage still held the cart without it.
  const stored = promoCart();
  delete stored.promocode;
  delete stored.prodamount_withdiscount;
  delete stored.prodamount_discountsum;
  stored.amount = 2000;
  const r = load({
    path: "/products",
    store: { tcart: JSON.stringify(stored) },
    liveCart: promoCart(),
    dataLayer: [{ ecommerce: { purchase: { actionField: { id: MAIN_ORDER } } } }],
  });
  submit(r, cartForm("form665507684"));
  const pending = JSON.parse(r.storage.get("rb_meta_pending"));
  assert.equal(pending.cart.promocode.promocode, "AUTUMN10");
  assert.equal(pending.cart.prodamount_withdiscount, 1800);
  // A copy: Tilda empties window.tcart right after this event.
  r.ctx.tcart.products.length = 0;
  assert.equal(JSON.parse(r.storage.get("rb_meta_pending")).cart.products.length, 2);
});

test("an empty live cart falls back to the stored one", () => {
  const r = load({
    path: "/products",
    store: { tcart: JSON.stringify(promoCart()) },
    liveCart: { products: [], prodamount: 0, amount: 0 },
    dataLayer: [{ ecommerce: { purchase: { actionField: { id: MAIN_ORDER } } } }],
  });
  submit(r, cartForm("form665507684"));
  assert.equal(JSON.parse(r.storage.get("rb_meta_pending")).cart.products.length, 2);
});

test("cash order on /thanks: pixel, server and TikTok get one Purchase with the paid value", () => {
  // A line removed from the cart stays in products with deleted: "yes".
  const cart = promoCart();
  cart.products.push({ name: "Тонер [sku:00-00000026]", sku: "00-00000026", price: 650, quantity: 1, amount: 650, deleted: "yes" });
  const pendingRecord = {
    cart,
    eventId: MAIN_ORDER + "_purchase",
    orderId: MAIN_ORDER,
    payment: "cash",
    ts: 1,
    phoneInput: "+380 (11) 111-11-01",
    emailInput: "test@example.com",
    event_time: 1_700_000_000,
    event_source_url: "https://robeauty.me/products",
  };
  const r = load({ path: "/thanks", store: { rb_meta_pending: JSON.stringify(pendingRecord) } });
  for (const cb of r.listeners.DOMContentLoaded || []) cb();

  const p = purchases(r);
  assert.equal(p.length, 1);
  assert.equal(p[0][2].value, 1800, "pixel value is after the 10 % promo code");
  assert.equal(p[0][2].num_items, 2);
  assert.equal(p[0][3].eventID, MAIN_ORDER + "_purchase");

  const server = r.requests.filter((q) => q.endpoint === "purchase");
  assert.equal(server.length, 1);
  assert.equal(server[0].body.event_id, MAIN_ORDER + "_purchase");
  // fb_capi_service takes value from cart.prodamount: it gets the same 1800.
  assert.equal(server[0].body.cart.prodamount, 1800);
  assert.equal(server[0].body.cart.products.length, 2, "the lines go as they were");

  const tt = r.tiktok.filter((t) => t.event === "Purchase");
  assert.equal(tt.length, 1);
  assert.equal(tt[0].data.value, 1800);
  assert.equal(tt[0].opts.eventId, MAIN_ORDER + "_purchase");
  assert.equal(tt[0].opts.server, true);
  assert.equal(r.storage.has("rb_meta_pending"), false);
});

/* ---------- cartGoodsValue: which Tilda total is the paid one ---------- */

const valueOf = (() => {
  const start = lines.findIndex((l) => l.startsWith("  var cartGoodsValue = (cartObj) => {"));
  assert.ok(start > -1, "cartGoodsValue not found");
  const end = lines.findIndex((l, i) => i > start && l === "  };");
  const ctx = { Number, isFinite };
  vm.runInNewContext(lines.slice(start, end + 1).join("\n") + "\nthis.f = cartGoodsValue;", ctx);
  return ctx.f;
})();

test("cartGoodsValue: promo code, store discount, both, neither", () => {
  assert.equal(valueOf({ prodamount: 2000 }), 2000);
  assert.equal(valueOf(promoCart()), 1800);
  assert.equal(valueOf({ prodamount: 2000, prodamount_withdyndiscount: 1900 }), 1900);
  // Tilda applies the promo code on top of the store discount.
  assert.equal(
    valueOf({ prodamount: 2000, prodamount_withdyndiscount: 1900, promocode: { promocode: "X" }, prodamount_withdiscount: 1710 }),
    1710,
  );
  // Bonuses (section 10) sit in the promo slot as BONUS-…: same field.
  assert.equal(
    valueOf({ prodamount: 2000, promocode: { promocode: "BONUS-ABCDEF123456", discountsum: 300 }, prodamount_withdiscount: 1700 }),
    1700,
  );
});

test("cartGoodsValue: leftovers and broken numbers fall back to prodamount", () => {
  // Promo code removed but the total left behind: not a discount.
  assert.equal(valueOf({ prodamount: 2000, prodamount_withdiscount: 1800 }), 2000);
  assert.equal(valueOf({ prodamount: 2000, promocode: {}, prodamount_withdiscount: "abc" }), 2000);
  assert.equal(valueOf({ prodamount: 2000, promocode: {}, prodamount_withdiscount: 2500 }), 2000);
  assert.equal(valueOf({ prodamount: 2000, promocode: {}, prodamount_withdiscount: -5 }), 2000);
  assert.equal(valueOf({ prodamount: 2000, promocode: {}, prodamount_withdiscount: "" }), 2000);
  assert.equal(valueOf({ prodamount: 2000, promocode: {}, prodamount_withdiscount: 0 }), 0, "a 100 % code is a real 0");
  assert.equal(valueOf({}), 0);
  assert.equal(valueOf(null), 0);
  assert.equal(valueOf({ prodamount: "1580" }), 1580);
});
