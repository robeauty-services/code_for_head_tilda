/* Section 12 of src/head.js: the cart snapshot sent to our server when an
 * order with online payment is submitted. Only the pure parts are checked
 * here — they are exposed on `window.__rbCartSnapshot`:
 *
 *   bareOrderId / orderIdFromDataLayer -> the order number Tilda announced
 *   parseTildaUtm / collectUtm         -> UTM tags from the TILDAUTM cookie
 *   collectProducts / buildBody        -> the cart lines and the request body
 *   readFormFields / readCartFields    -> the whitelist that makes up `details`
 *   collectDetails                     -> live values first, submit snapshot second
 *
 * The block (from the section 12 header to the end of the file) runs in
 * node:vm with a fake window and document. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const start = lines.findIndex((l) => l.startsWith("/* ===================== 12. Cart snapshot"));
const block = lines.slice(start).join("\n");

const asked = [];

class FakeFormData {
  constructor(form) {
    if (!form || !form.fields) throw new TypeError("not a form");
    this.fields = form.fields;
  }
  get(name) {
    asked.push(name);
    return name in this.fields ? this.fields[name] : null;
  }
}

const load = () => {
  const window = { console, location: { href: "https://robeauty.me/cart", search: "" } };
  const document = { cookie: "", addEventListener: () => {} };
  vm.runInNewContext(block, { window, document, localStorage: { getItem: () => null }, console, JSON, Math, Number, RegExp, String, isFinite, parseInt, decodeURIComponent, FormData: FakeFormData });
  return window.__rbCartSnapshot;
};

const api = load();
// Objects built inside the vm have the vm's prototypes; compare plain copies.
const plain = (x) => JSON.parse(JSON.stringify(x));

/* How the cookie actually looks: Tilda lowercases the URL, joins the utm_*
 * pairs with "|||" and percent-encodes the whole string once more. */
const tildaCookie = (pairs) => encodeURIComponent(pairs.map((p) => p + "|||").join(""));

test("order number: the digits of Tilda's stat id", () => {
  assert.equal(api.bareOrderId("T202609-1374965894"), "1374965894");
  assert.equal(api.bareOrderId(" 1158838403 "), "1158838403");
  assert.equal(api.bareOrderId(1158838403), "1158838403");
  assert.equal(api.bareOrderId(""), "");
  assert.equal(api.bareOrderId(null), "");
  assert.equal(api.bareOrderId("12345"), ""); // too short to be an order
  assert.equal(api.bareOrderId("1234567890123"), ""); // too long
  assert.equal(api.bareOrderId("T202609-abc"), "");
});

test("order number is read by field, not by event name", () => {
  // Section 9 renames the purchase push to rb_purchase_submitted.
  const held = {
    event: "rb_purchase_submitted",
    ecommerce: { purchase: { actionField: { id: "T202609-1158838403" } } },
  };
  assert.equal(api.orderIdFromDataLayer([{ event: "pageview" }, held]), "1158838403");
  assert.equal(api.orderIdFromDataLayer([{ ecommerce: { transaction_id: "1158838403" } }]), "1158838403");
  assert.equal(api.orderIdFromDataLayer([{ transaction_id: "1158838403" }]), "1158838403");
});

test("the latest order in dataLayer wins, junk is skipped", () => {
  const dl = [
    { ecommerce: { purchase: { actionField: { id: "1111111111" } } } },
    { event: "add_to_cart", ecommerce: { items: [] } },
    { transaction_id: "0" },
    { ecommerce: { purchase: { actionField: { id: "2222222222" } } } },
  ];
  assert.equal(api.orderIdFromDataLayer(dl), "2222222222");
  assert.equal(api.orderIdFromDataLayer([]), "");
  assert.equal(api.orderIdFromDataLayer(undefined), "");
});

test("TILDAUTM: every pair, decoded twice", () => {
  const utm = plain(api.parseTildaUtm(tildaCookie(["utm_source=instagram", "utm_medium=cpc", "utm_campaign=black%20friday"])));
  assert.deepEqual(utm, { utm_source: "instagram", utm_medium: "cpc", utm_campaign: "black friday" });
});

test("TILDAUTM: amp; prefix, plus signs, unknown keys, broken input", () => {
  const utm = plain(api.parseTildaUtm(tildaCookie(["utm_source=google", "amp;utm_medium=cpc", "utm_term=hair+oil", "gclid=xyz", "utm_content="])));
  assert.deepEqual(utm, { utm_source: "google", utm_medium: "cpc", utm_term: "hair oil" });
  assert.deepEqual(plain(api.parseTildaUtm("")), {});
  assert.deepEqual(plain(api.parseTildaUtm(null)), {});
  assert.deepEqual(plain(api.parseTildaUtm("utm_source")), {});
  assert.deepEqual(plain(api.parseTildaUtm("%E0%A4%A")), {}); // throws on decode
});

test("TILDAUTM: a value is cut to 200 characters", () => {
  const long = "a".repeat(250);
  const utm = plain(api.parseTildaUtm(tildaCookie(["utm_campaign=" + long])));
  assert.equal(utm.utm_campaign.length, 200);
});

test("UTM sources in priority order", () => {
  const cookie = tildaCookie(["utm_source=instagram", "utm_medium=cpc"]);
  const search = "?utm_source=google&utm_medium=organic&utm_campaign=autumn";

  // Tilda's cookie wins; the URL only fills what is missing.
  assert.deepEqual(plain(api.collectUtm(cookie, "facebook", search)), {
    utm_source: "instagram",
    utm_medium: "cpc",
    utm_campaign: "autumn",
  });
  // No Tilda cookie: the utm_source cookie from section 1, then the URL.
  assert.deepEqual(plain(api.collectUtm("", "facebook", search)), {
    utm_source: "facebook",
    utm_medium: "organic",
    utm_campaign: "autumn",
  });
  // Nothing anywhere.
  assert.deepEqual(plain(api.collectUtm("", "", "")), {});
});

test("products: name, sku, quantity, price, url", () => {
  const cart = {
    products: [
      { name: "Сыворотка [sku:00-00003666]", quantity: "2", price: "890", url: "https://robeauty.me/serum", uid: "123" },
      { name: "Крем", sku: "00-00001111", quantity: 1, price: 1540.5, url: "" },
      { name: "Набор", uid: "777", quantity: "", price: "abc" },
    ],
  };
  assert.deepEqual(plain(api.collectProducts(cart)), [
    { name: "Сыворотка [sku:00-00003666]", sku: "00-00003666", quantity: 2, price: 890, url: "https://robeauty.me/serum" },
    { name: "Крем", sku: "00-00001111", quantity: 1, price: 1540.5, url: "" },
    { name: "Набор", sku: "777", quantity: 1, price: 0, url: "" },
  ]);
});

test("products: an empty cart gives an empty list", () => {
  assert.deepEqual(plain(api.collectProducts(null)), []);
  assert.deepEqual(plain(api.collectProducts({})), []);
  assert.deepEqual(plain(api.collectProducts({ products: [] })), []);
});

test("products: 50 lines at most, strings cut to 200", () => {
  const products = [];
  for (let i = 0; i < 60; i++) products.push({ name: "x".repeat(250), quantity: 1, price: 1, url: "u".repeat(250) });
  const items = plain(api.collectProducts({ products }));
  assert.equal(items.length, 50);
  assert.equal(items[0].name.length, 200);
  assert.equal(items[0].url.length, 200);
});

test("body: fits as it is, or loses the tail of the cart", () => {
  const small = { order_no: "1158838403", products: [{ name: "Крем", sku: "1", quantity: 1, price: 10, url: "" }], utm: {} };
  assert.equal(api.buildBody(small), JSON.stringify(small));

  // 50 lines of 200-character strings stay around 33 KB, so the trimming below
  // never happens in a real cart — it is the belt for a payload that grows.
  const products = [];
  for (let i = 0; i < 300; i++) products.push({ name: "x".repeat(200), sku: "s".repeat(200), quantity: 1, price: 1, url: "u".repeat(200) });
  const big = { order_no: "1158838403", products, utm: { utm_source: "instagram" } };
  const body = api.buildBody(big);
  const sent = JSON.parse(body);
  assert.ok(body.length <= 60 * 1024);
  assert.ok(sent.products.length < 300 && sent.products.length > 0);
  assert.equal(sent.utm.utm_source, "instagram"); // the UTMs always survive
});

/* ---------- details: what the customer typed ---------- */

test("form fields: the whitelist only, trimmed", () => {
  asked.length = 0;
  const form = {
    fields: {
      name: " Анатолій ",
      surname: "Коротенко",
      city: "Київ",
      address: "Відділення №12",
      CallOption: "Можна без дзвінка",
      paymentsystem: "wayforpay",
      // None of these may ever be read.
      phone: "+380991112233",
      Email: "a@b.c",
      "ma_name": "x",
      visited_pages: "[]",
      cart_products: "[]",
    },
  };
  assert.deepEqual(plain(api.readFormFields(form)), {
    name: "Анатолій",
    surname: "Коротенко",
    city: "Київ",
    address: "Відділення №12",
    call_option: "Можна без дзвінка",
    payment_system: "wayforpay",
  });
  assert.deepEqual(asked, ["name", "surname", "city", "address", "CallOption", "paymentsystem"]);
});

test("form fields: empty and missing ones are left out, a broken form gives nothing", () => {
  assert.deepEqual(plain(api.readFormFields({ fields: { name: "Іван", surname: "   ", city: "" } })), { name: "Іван" });
  assert.deepEqual(plain(api.readFormFields({ fields: {} })), {});
  assert.deepEqual(plain(api.readFormFields(null)), {}); // FormData throws
});

test("cart fields: promo code, delivery name, total from tcart.amount", () => {
  const cart = {
    promocode: { promocode: "SALE10", discountpercent: "10" },
    delivery: { name: "Нова Пошта: відділення", price: 70 },
    total: 2, // the number of items, not money
    amount: 1540,
  };
  assert.deepEqual(plain(api.readCartFields(cart)), {
    promocode: "SALE10",
    delivery: "Нова Пошта: відділення",
    total: 1540,
  });
  // Both fields can also come as plain strings.
  assert.deepEqual(plain(api.readCartFields({ promocode: "SALE10", delivery: "Самовивіз", amount: "890" })), {
    promocode: "SALE10",
    delivery: "Самовивіз",
    total: 890,
  });
});

test("cart fields: a BONUS- pseudo code is not a promo code", () => {
  // Section 10 puts bonuses into the same slot to show them in the cart.
  const cart = { promocode: { promocode: "BONUS-ABCDEF123456", discountsum: 99.5 }, amount: 1900.5 };
  assert.deepEqual(plain(api.readCartFields(cart)), { total: 1900.5 });
});

test("cart fields: nothing to report", () => {
  assert.deepEqual(plain(api.readCartFields(null)), {});
  assert.deepEqual(plain(api.readCartFields({})), {});
  assert.deepEqual(plain(api.readCartFields({ amount: 0, promocode: {}, delivery: {} })), {});
  assert.deepEqual(plain(api.readCartFields({ amount: "abc" })), {});
});

test("details: live values win, the submit snapshot fills the gaps", () => {
  const live = { name: "Іван", city: "Київ" };
  const saved = { name: "Старе", surname: "Петренко", city: "", promocode: "SALE10", total: 1540 };
  assert.deepEqual(plain(api.collectDetails(live, saved)), {
    name: "Іван",
    surname: "Петренко",
    city: "Київ",
    promocode: "SALE10",
    total: 1540,
  });
  assert.deepEqual(plain(api.collectDetails({}, null)), {});
  assert.deepEqual(plain(api.collectDetails(null, null)), {});
});
