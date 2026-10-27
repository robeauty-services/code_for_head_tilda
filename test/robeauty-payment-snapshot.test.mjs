/* Section 11 of src/head.js: `window.__rbPaymentSnapshot`, called by section
 * 10 right after Tilda built `tildaForm.tildapayment`. It stores what the
 * customer pays for a main-cart order in localStorage.rb_order_payment.
 *
 *   compute -> goods before/after discount, discount type, delivery, total
 *   hook    -> writes only for the main cart form, never breaks the order
 *
 * The block (from the section 11 header to the end of the file) runs in
 * node:vm with a fake window, form and localStorage. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const start = lines.findIndex((l) => l.startsWith("/* ===================== 11. Payment snapshot"));
const block = lines.slice(start).join("\n");

const MAIN_FORM = "form665507684";
const UPSELL_FORM = "form2235408313";

const fakeForm = (id, bonusApplied) => ({
  nodeType: 1,
  id,
  querySelector: (sel) => {
    if (sel === 'input[name="bonus_applied"]' && bonusApplied != null) {
      return { value: String(bonusApplied) };
    }
    return null;
  },
});

const load = (win = {}) => {
  const store = {};
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
  };
  const warnings = [];
  const window = Object.assign({ console: { warn: (...a) => warnings.push(a) } }, win);
  vm.runInNewContext(block, { window, localStorage, console: window.console, JSON, Math, Date });
  return { window, store, warnings };
};

// Objects built inside the vm have the vm's prototypes; compare plain copies.
const plain = (x) => JSON.parse(JSON.stringify(x));
const compute = (...args) => plain(load().window.__rbPaymentSnapshot.compute(...args, 1));

test("no discount: goods and total are the same", () => {
  const s = compute({ amount: "1600", prodamount: "1600" }, { amount: "1600", prodamount: "1600" }, 0);
  assert.equal(s.goods_full, 1600);
  assert.equal(s.goods_after, 1600);
  assert.equal(s.discount, 0);
  assert.equal(s.discount_type, null);
  assert.equal(s.discount_code, null);
  assert.equal(s.delivery, 0);
  assert.equal(s.to_pay, 1600);
  assert.equal(s.currency, "UAH");
});

test("promo code: goods after discount come from prodamount_withdiscount", () => {
  const s = compute(
    { amount: "1800", prodamount: "2000", prodamount_withdiscount: "1800", promocode: "SALE10", discount: "200" },
    { amount: "1800", prodamount: "2000", promocode: { promocode: "SALE10", discountpercent: "10" } },
    0,
  );
  assert.equal(s.goods_full, 2000);
  assert.equal(s.goods_after, 1800);
  assert.equal(s.discount, 200);
  assert.equal(s.discount_type, "promo");
  assert.equal(s.discount_code, "SALE10");
  assert.equal(s.to_pay, 1800);
});

test("bonuses: tildapayment already cut, BONUS-ref is not reported as a code", () => {
  // After applyToPayment: prodamount reduced, promocode/discount fields deleted.
  const s = compute(
    { amount: "1900.5", prodamount: "1900.5" },
    { amount: "1900.5", prodamount: "2000", promocode: { promocode: "BONUS-ABCDEF123456", discountsum: 99.5 } },
    99.5,
  );
  assert.equal(s.goods_full, 2000);
  assert.equal(s.goods_after, 1900.5);
  assert.equal(s.discount, 99.5);
  assert.equal(s.discount_type, "bonus");
  assert.equal(s.discount_code, null);
  assert.equal(s.to_pay, 1900.5);
});

test("delivery: whatever is paid above the goods", () => {
  const s = compute({ amount: "1870", prodamount: "1800" }, { prodamount: "2000" }, 200);
  assert.equal(s.discount, 200);
  assert.equal(s.delivery, 70);
  assert.equal(s.to_pay, 1870);
});

test("discount with no bonus and no real promo code is 'other'", () => {
  const s = compute(
    { amount: "1500", prodamount: "1500" },
    { prodamount: "2000", promocode: { promocode: "BONUS-ABCDEF123456", discountsum: 500 } },
    0,
  );
  assert.equal(s.discount, 500);
  assert.equal(s.discount_type, "other");
  assert.equal(s.discount_code, null);
});

test("broken data gives null", () => {
  const { window } = load();
  const c = window.__rbPaymentSnapshot.compute;
  assert.equal(c(null, { prodamount: "1" }, 0, 1), null);
  assert.equal(c({ amount: "1", prodamount: "1" }, null, 0, 1), null);
  assert.equal(c({ amount: "abc", prodamount: "1" }, { prodamount: "1" }, 0, 1), null);
  assert.equal(c({ amount: "1", prodamount: "1" }, { prodamount: "" }, 0, 1), null);
  assert.equal(c({ amount: "1" }, { prodamount: "1" }, 0, 1), null);
});

test("hook writes rb_order_payment for the main cart, jQuery-wrapped form too", () => {
  const tildaForm = { tildapayment: { amount: "1900", prodamount: "1900" } };
  const tcart = { amount: "1900", prodamount: "2000", promocode: { promocode: "BONUS-ABCDEF123456", discountsum: 100 } };
  const { window, store } = load({ tildaForm, tcart });
  window.__rbPaymentSnapshot([fakeForm(MAIN_FORM, 100)]);
  const s = JSON.parse(store.rb_order_payment);
  assert.equal(s.v, 1);
  assert.equal(s.discount_type, "bonus");
  assert.equal(s.to_pay, 1900);
  assert.equal(typeof s.savedAt, "number");
});

test("hook ignores the upsell form, the off switch and broken data", () => {
  const tildaForm = { tildapayment: { amount: "500", prodamount: "500" } };
  const tcart = { prodamount: "500" };

  let r = load({ tildaForm, tcart });
  r.window.__rbPaymentSnapshot(fakeForm(UPSELL_FORM));
  assert.equal(r.store.rb_order_payment, undefined);

  r = load({ tildaForm, tcart, RB_PAY_SNAPSHOT_ENABLED: false });
  r.window.__rbPaymentSnapshot(fakeForm(MAIN_FORM));
  assert.equal(r.store.rb_order_payment, undefined);

  r = load({ tcart });
  r.window.__rbPaymentSnapshot(fakeForm(MAIN_FORM));
  assert.equal(r.store.rb_order_payment, undefined);
});

test("a throwing storage only warns", () => {
  const { window, warnings } = load({ tildaForm: { tildapayment: { amount: "1", prodamount: "1" } }, tcart: { prodamount: "1" } });
  // Swap in a storage that throws (private mode, quota).
  const ctx = { window, localStorage: { setItem: () => { throw new Error("quota"); } }, console: window.console, JSON, Math, Date };
  vm.runInNewContext(block, ctx);
  assert.doesNotThrow(() => window.__rbPaymentSnapshot(fakeForm(MAIN_FORM)));
  assert.equal(warnings[0][0], "[rb-pay]");
});
