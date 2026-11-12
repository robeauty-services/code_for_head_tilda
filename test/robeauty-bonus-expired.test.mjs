/* Section 10 of src/head.js: bonus redemption in the cart, the expired-hold
 * paths. Before 1.0.34 a hold that ran out (or vanished) left its display
 * code `BONUS-<ref>` in `tcart.promocode`; Tilda copied it into
 * `tildaForm.tildapayment`, its server answered "Store booking error:
 * Promocode not found", and the customer was stuck at checkout
 * (2026-11-07/08, two customers, 7 errors in the Tilda panel).
 *
 *   expired while the cart is open -> the guard drops the code, full price
 *   reload with a leftover code     -> the guard drops it too
 *   tab in the background           -> «Оформити» is held, code dropped;
 *                                      the payment hook restores full price
 *   a normal order with bonuses     -> unchanged
 *   a real promo code               -> never touched
 *
 * The block (from the section 10 header to the section 11 one) runs in
 * node:vm with a fake cart window, a fake Tilda (recalculation + the
 * tildapayment builder copied from tilda-forms-payments) and a fake clock.
 * No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const start = lines.findIndex((l) => l.startsWith("/* ===================== 10. Bonus redemption in cart"));
const end = lines.findIndex((l) => l.startsWith("/* ===================== 11. Payment snapshot"));
const block = lines.slice(start, end).join("\n");

const CODE = "BONUS-ABCDEF123456";
const T0 = Date.UTC(2026, 10, 12, 10, 0, 0);
const MIN = 60 * 1000;

const plain = (x) => JSON.parse(JSON.stringify(x));
const flush = () => new Promise((r) => setTimeout(r, 0));

/* A tiny element: enough for mount(), render(), setHiddenFields(). */
const el = (tag = "div") => {
  const kids = [];
  const e = {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    style: {},
    className: "",
    innerHTML: "",
    value: "",
    disabled: false,
    attrs: {},
    previousSibling: null,
    parentNode: null,
    kids,
    clicks: 0,
    appendChild(c) {
      kids.push(c);
      c.parentNode = e;
      return c;
    },
    removeChild(c) {
      const i = kids.indexOf(c);
      if (i >= 0) kids.splice(i, 1);
      c.parentNode = null;
    },
    insertBefore(c, ref) {
      kids.push(c);
      c.parentNode = e;
      ref.previousSibling = c;
      return c;
    },
    setAttribute(k, v) {
      e.attrs[k] = String(v);
    },
    getAttribute(k) {
      return k in e.attrs ? e.attrs[k] : null;
    },
    querySelector(sel) {
      const m = sel.match(/^input\[name="([^"]+)"\]$/);
      if (m) return kids.find((k) => k.name === m[1]) || null;
      return null;
    },
    click() {
      e.clicks += 1;
    },
    closest() {
      return null;
    },
    scrollIntoView() {},
    focus() {},
    setSelectionRange() {},
  };
  return e;
};

/* `opts`: hold (stored in localStorage before boot), products, promocode,
 * delivery, open, status (what /status answers). */
const setup = (opts = {}) => {
  let now = opts.now ?? T0;
  const FakeDate = { now: () => now };

  const store = {};
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
  };
  if (opts.hold) store.robeauty_bonus_hold = JSON.stringify(opts.hold);

  // ----- the cart window -----
  const cartForm = el("form");
  const submitBtn = el("button");
  cartForm.querySelector = (sel) => {
    if (sel === ".t-submit") return submitBtn;
    const m = sel.match(/^input\[name="([^"]+)"\]$/);
    if (m) return cartForm.kids.find((k) => k.name === m[1]) || null;
    return null;
  };
  const phone = el("input");
  phone.value = opts.phone ?? "+38 (067) 111-22-33";
  const group = el("div");
  const formBody = el("div");
  group.parentNode = formBody;
  const promoWrap = el("div");
  promoWrap.closest = (sel) => (sel === ".t-input-group" ? group : null);
  const promoInput = el("input");
  const promoBtn = el("div");
  let redeem = null;
  const codeInput = el("input");
  codeInput.attrs["data-rbr"] = "code";
  codeInput.value = opts.smsCode ?? "123456";
  formBody.insertBefore = (c, ref) => {
    redeem = c;
    ref.previousSibling = c;
    c.parentNode = formBody;
    return c;
  };
  let open = opts.open ?? true;
  const cartWin = {
    classList: { contains: (c) => c === "t706__cartwin_showed" && open },
    querySelector(sel) {
      if (sel === "form") return cartForm;
      if (sel === 'input[name="phone"]') return phone;
      if (sel === 'input[type="tel"]') return phone;
      if (sel === ".t-inputpromocode__wrapper") return promoWrap;
      if (sel === ".t-inputpromocode") return promoInput;
      if (sel === ".t-inputpromocode__btn") return promoBtn;
      if (sel === ".rb-redeem") return redeem;
      if (sel === '[data-rbr="code"]') return codeInput;
      return null;
    },
  };

  // ----- document -----
  const listeners = [];
  const document = {
    readyState: "complete",
    visibilityState: "visible",
    activeElement: null,
    head: el("head"),
    querySelector: (sel) => (sel === ".t706__cartwin" ? cartWin : null),
    getElementById: () => null,
    createElement: (tag) => el(tag),
    addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture: !!capture }),
  };

  // ----- network -----
  const calls = [];
  const fetch = (url, init) => {
    const body = init && init.body ? JSON.parse(init.body) : null;
    calls.push({ path: String(url).replace(/^.*\/bonus/, ""), body });
    let res = { ok: true };
    if (/\/status$/.test(url)) res = { ok: true, usable: opts.status ?? true };
    if (/\/availability$/.test(url)) res = { ok: true, enabled: true, excludedSkus: [] };
    return Promise.resolve({ json: () => Promise.resolve(res) });
  };

  // ----- Tilda -----
  const redraws = [];
  const window = {
    console: { warn() {} },
    getComputedStyle: () => ({ display: open ? "block" : "none" }),
  };
  /* Tilda's CartCalculator (cart 1.1), the one behaviour that matters here:
   * a parked promo code (`appliedPromocode`) goes back into the empty slot on
   * the next recalculation (store discount smaller than the promo — here there
   * is none). `sticky` is a code Tilda keeps putting back whatever we do. */
  window.cartCalculator = { appliedPromocode: opts.parked ? { ...opts.parked } : null };
  const recalc = () => {
    const c = window.tcart;
    if (opts.sticky) c.promocode = { ...opts.sticky };
    else if (!c.promocode && window.cartCalculator.appliedPromocode) c.promocode = { ...window.cartCalculator.appliedPromocode };
    let prod = 0;
    for (const p of c.products) {
      if (p.deleted === "yes") continue;
      p.amount = Math.round(p.price * p.quantity * 100) / 100;
      prod += p.amount;
    }
    c.prodamount = prod;
    if (c.promocode && typeof c.promocode === "object" && c.promocode.discountsum > 0) {
      c.prodamount_discountsum = c.promocode.discountsum;
      c.prodamount_withdiscount = prod - c.promocode.discountsum;
    } else if (c.promocode && typeof c.promocode === "object" && c.promocode.discountpercent > 0) {
      c.prodamount_discountsum = Math.round(prod * c.promocode.discountpercent) / 100;
      c.prodamount_withdiscount = prod - c.prodamount_discountsum;
    } else {
      delete c.prodamount_discountsum;
      delete c.prodamount_withdiscount;
    }
    c.amount = (c.prodamount_withdiscount ?? prod) + (c.delivery ? c.delivery.price : 0);
  };
  window.tcart__updateTotalProductsinCartObj = () => {
    redraws.push(window.tcart.promocode ? window.tcart.promocode.promocode : null);
    recalc();
  };
  const shown = []; // total the cart window shows after each tcart__reDrawTotal
  for (const n of ["tcart__saveLocalObj", "tcart__reDrawProducts", "tcart__reDrawCartIcon"]) {
    window[n] = () => {};
  }
  window.tcart__reDrawTotal = () => shown.push(window.tcart.amount);
  window.tcart = {
    products: plain(
      opts.products ?? [
        { name: "Сироватка [sku:00-00003330]", price: 1200, quantity: 1 },
        { name: "Крем [sku:00-00003241]", price: 800, quantity: 1 },
      ],
    ),
    promocode: opts.promocode,
    delivery: opts.delivery ? { name: "НП", price: opts.delivery } : undefined,
  };
  recalc();

  /* What tilda-forms-payments does with the cart (fields that matter here). */
  const tildaAddPaymentInfo = function () {
    const c = window.tcart;
    window.tildaForm.amountForStat = c.amount;
    const tp = { amount: c.amount };
    if (c.promocode && c.promocode.promocode) {
      tp.promocode = c.promocode.promocode;
      if (c.prodamount_discountsum > 0) tp.discount = c.prodamount_discountsum;
      if (c.prodamount_withdiscount > 0) tp.prodamount_withdiscount = c.prodamount_withdiscount;
    }
    if (c.prodamount > 0) tp.prodamount = c.prodamount;
    tp.products = plain(c.products.filter((p) => p.deleted !== "yes"));
    window.tildaForm.tildapayment = tp;
  };
  window.tildaForm = { addPaymentInfoToForm: tildaAddPaymentInfo, clearTCart() {} };

  // ----- timers: the guard is ticked by hand -----
  const intervals = [];
  const ctx = {
    window,
    document,
    localStorage,
    fetch,
    Date: FakeDate,
    setTimeout,
    clearTimeout,
    setInterval: (fn, ms) => {
      intervals.push({ fn, ms });
      return intervals.length;
    },
    clearInterval: () => {},
  };
  vm.runInNewContext(block, ctx);
  const guard = intervals.find((i) => i.ms === 500).fn;

  const checkoutClick = () => {
    const ev = {
      type: "click",
      prevented: false,
      target: {
        closest: (sel) => (sel === ".t706__orderform form" ? cartForm : sel === ".t-submit" ? submitBtn : null),
      },
      preventDefault() {
        ev.prevented = true;
      },
      stopImmediatePropagation() {},
      stopPropagation() {},
    };
    for (const l of listeners) if (l.type === "click" && l.capture) l.fn(ev);
    return ev;
  };
  const keyEnter = (target) => {
    const ev = {
      type: "keydown",
      key: "Enter",
      keyCode: 13,
      target,
      prevented: false,
      preventDefault() {
        ev.prevented = true;
      },
      stopPropagation() {},
    };
    for (const l of listeners) if (l.type === "keydown") l.fn(ev);
    return ev;
  };
  /* Tilda's submit: builds tildapayment through the (wrapped) hook. */
  const tildaSubmit = () => {
    window.tildaForm.addPaymentInfoToForm(cartForm);
    return window.tildaForm.tildapayment;
  };
  const hidden = (name) => {
    const i = cartForm.kids.find((k) => k.name === name);
    return i ? i.value : null;
  };

  return {
    window,
    store,
    calls,
    redraws,
    shown,
    submitBtn,
    guard,
    checkoutClick,
    keyEnter,
    codeInput,
    phone,
    tildaSubmit,
    hidden,
    note: () => (redeem ? redeem.innerHTML : ""),
    tick: (ms) => {
      now += ms;
    },
    setOpen: (v) => {
      open = v;
    },
    visible: () => {
      for (const l of listeners) if (l.type === "visibilitychange") l.fn();
    },
  };
};

const liveHold = (over = {}) => ({
  id: 1647,
  amount: 300,
  code: CODE,
  phone: "380671112233",
  expiresAt: T0 + 44 * MIN,
  ...over,
});

test("normal order with bonuses: discount shown, cut into prices, code never reaches Tilda", async () => {
  const s = setup({ hold: liveHold() });
  s.guard();
  assert.equal(s.window.tcart.promocode.promocode, CODE);
  assert.equal(s.window.tcart.amount, 1700);

  const ev = s.checkoutClick();
  assert.equal(ev.prevented, true, "held while the server is asked");
  await flush();
  await flush();
  assert.ok(s.calls.some((c) => c.path === "/status"));
  assert.equal(s.submitBtn.clicks, 1, "live hold: the click is repeated");

  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.discount, undefined);
  assert.equal(tp.amount, 1700);
  assert.equal(tp.prodamount, 1700);
  const sum = tp.products.reduce((a, p) => a + p.price * p.quantity, 0);
  assert.equal(sum, 1700);
  assert.equal(s.hidden("bonus_ref"), CODE);
  assert.equal(s.hidden("bonus_applied"), "300");
  assert.equal(JSON.parse(s.store.robeauty_bonus_hold).submitted, true);
});

test("hold expires while the cart is open: the code is dropped, full price, note shown", () => {
  const s = setup({ hold: liveHold() });
  s.guard();
  assert.equal(s.window.tcart.promocode.promocode, CODE);

  s.tick(45 * MIN);
  s.guard();
  assert.equal(s.window.tcart.promocode, undefined, "BONUS-… must not stay in the slot");
  assert.equal(s.window.tcart.amount, 2000);
  assert.equal(s.store.robeauty_bonus_hold, undefined);
  assert.match(s.note(), /Час резерву минув/);

  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.amount, 2000);
  assert.equal(s.hidden("bonus_ref"), null);
});

test("reload with a leftover BONUS-… and no live hold: the guard drops it", () => {
  const s = setup({ promocode: { promocode: CODE, discountsum: 300 } });
  assert.equal(s.window.tcart.amount, 1700);
  s.guard();
  assert.equal(s.window.tcart.promocode, undefined);
  assert.equal(s.window.tcart.amount, 2000);

  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.amount, 2000);
});

test("reload with an expired hold in localStorage and the code in the slot: dropped", () => {
  const s = setup({
    hold: liveHold({ expiresAt: T0 - MIN }),
    promocode: { promocode: CODE, discountsum: 300 },
  });
  s.guard();
  assert.equal(s.window.tcart.promocode, undefined);
  assert.equal(s.store.robeauty_bonus_hold, undefined);
});

test("tab in the background: «Оформити» after expiry is held and the discount dropped", () => {
  const s = setup({ hold: liveHold() });
  s.guard();
  s.tick(50 * MIN); // the guard's timer did not run meanwhile
  const statusBefore = s.calls.filter((c) => c.path === "/status").length;

  const ev = s.checkoutClick();
  assert.equal(ev.prevented, true, "no order with a discount nobody will debit");
  assert.equal(s.submitBtn.clicks, 0);
  assert.equal(s.window.tcart.promocode, undefined);
  assert.equal(s.window.tcart.amount, 2000);
  assert.match(s.note(), /Час резерву минув/);
  assert.match(s.note(), /rb-redeem__note--err/);
  assert.equal(s.calls.filter((c) => c.path === "/status").length, statusBefore, "no server round trip needed");

  // The next click goes through at the real price.
  const ev2 = s.checkoutClick();
  assert.equal(ev2.prevented, false);
  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.amount, 2000);
});

test("tab in the background: coming back runs the guard at once", () => {
  const s = setup({ hold: liveHold() });
  s.guard();
  s.tick(50 * MIN);
  s.visible();
  assert.equal(s.window.tcart.promocode, undefined);
  assert.match(s.note(), /Час резерву минув/);
});

test("payment hook safety net: expired hold, code still in the cart -> code off, full amount back", () => {
  const s = setup({ hold: liveHold(), delivery: 70 });
  s.guard();
  assert.equal(s.window.tcart.amount, 1770);
  s.tick(50 * MIN);

  // Tilda builds tildapayment without our click handler having run.
  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined, "Tilda would answer «Promocode not found»");
  assert.equal(tp.discount, undefined);
  assert.equal(tp.prodamount_withdiscount, undefined);
  assert.equal(tp.amount, 2070, "goods 2000 + delivery 70, no discount");
  assert.equal(tp.prodamount, 2000);
  const sum = tp.products.reduce((a, p) => a + p.price * p.quantity, 0);
  assert.equal(sum, 2000, "item prices untouched");
  assert.equal(s.hidden("bonus_ref"), null);
  assert.equal(s.hidden("bonus_applied"), null);
});

test("payment hook safety net: no hold at all, code in the cart -> code off, full amount back", () => {
  const s = setup({ promocode: { promocode: CODE, discountsum: 300 } });
  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.amount, 2000);
});

test("payment hook: bonuses paused (cart below 1500) -> nothing applied, no code left", () => {
  const s = setup({
    hold: liveHold(),
    products: [{ name: "Тонер [sku:00-00003355]", price: 700, quantity: 1 }],
  });
  s.guard();
  assert.equal(s.window.tcart.promocode, undefined);
  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.amount, 700);
  assert.equal(s.hidden("bonus_ref"), null);
});

test("real promo code, no hold: never touched by the guard or the payment hook", () => {
  for (const code of ["SALE10", "BONUS-10", "BONUS-WELCOME", "BONUS-ABCDEF12345"]) {
    const s = setup({ promocode: { promocode: code, discountpercent: 10 } });
    s.guard();
    assert.equal(s.window.tcart.promocode && s.window.tcart.promocode.promocode, code, code);
    const ev = s.checkoutClick();
    assert.equal(ev.prevented, false, code);
    const tp = s.tildaSubmit();
    assert.equal(tp.promocode, code, code);
    assert.equal(tp.discount, 200, code);
    assert.equal(tp.amount, 1800, code);
  }
});

test("real promo code typed over live bonuses: bonuses released, promo kept", () => {
  const s = setup({ hold: liveHold() });
  s.guard();
  s.window.tcart.promocode = { promocode: "SALE10", discountpercent: 10 };
  s.window.tcart__updateTotalProductsinCartObj();
  s.guard();
  assert.equal(s.window.tcart.promocode.promocode, "SALE10");
  assert.ok(s.calls.some((c) => c.path === "/cancel" && c.body.ref === CODE));
  assert.equal(s.store.robeauty_bonus_hold, undefined);
  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, "SALE10");
  assert.equal(tp.amount, 1800);
});

test("another BONUS-… in the slot over a live hold is not a promo code: ours stays", () => {
  const s = setup({ hold: liveHold() });
  s.guard();
  s.window.tcart.promocode = { promocode: "BONUS-ZZZZZZZZZZZZ", discountsum: 100 };
  s.guard();
  assert.ok(!s.calls.some((c) => c.path === "/cancel"), "our hold is not released");
  assert.equal(s.window.tcart.promocode.promocode, CODE);
  assert.equal(s.window.tcart.amount, 1700);
});

test("hold runs out while «Оформити» waits for the server: the click is not repeated", async () => {
  const s = setup({ hold: liveHold({ expiresAt: T0 + 2000 }) });
  s.guard();
  const ev = s.checkoutClick();
  assert.equal(ev.prevented, true);
  s.tick(3000);
  await flush();
  await flush();
  assert.equal(s.submitBtn.clicks, 0);
  assert.equal(s.window.tcart.promocode, undefined);
  assert.match(s.note(), /Час резерву минув/);
});

test("hold runs out while «Оформити» waits, and the guard expires it first: still no replay", async () => {
  const s = setup({ hold: liveHold({ expiresAt: T0 + 2000 }) });
  s.guard();
  const ev = s.checkoutClick();
  assert.equal(ev.prevented, true);
  s.tick(3000);
  s.guard(); // the 500 ms timer runs while /status is in flight
  assert.equal(s.window.tcart.promocode, undefined);
  await flush();
  await flush();
  assert.equal(s.submitBtn.clicks, 0, "no silent order at the full price");
  assert.match(s.note(), /Час резерву минув/);
  assert.match(s.note(), /rb-redeem__note--err/);
});

test("Tilda's calculator parked our code: it is forgotten too, nothing comes back, checkout not blocked", () => {
  const s = setup({ hold: liveHold({ expiresAt: T0 - MIN }), parked: { promocode: CODE, discountsum: 300 } });
  s.guard();
  assert.equal(s.window.cartCalculator.appliedPromocode, null);
  assert.equal(s.window.tcart.promocode, undefined);
  s.window.tcart__updateTotalProductsinCartObj(); // e.g. an item removed
  assert.equal(s.window.tcart.promocode, undefined, "no resurrection");
  assert.equal(s.window.tcart.amount, 2000);
  const ev = s.checkoutClick();
  assert.equal(ev.prevented, false);
  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.amount, 2000);
});

test("a code Tilda keeps putting back never locks checkout; the payment goes without it at the full sum", () => {
  const s = setup({ sticky: { promocode: CODE, discountsum: 300 } });
  s.guard();
  assert.equal(s.window.tcart.promocode.promocode, CODE, "sticky by construction");
  for (let i = 0; i < 3; i++) {
    const ev = s.checkoutClick();
    assert.equal(ev.prevented, false, "click " + (i + 1) + " must go through");
  }
  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.discount, undefined);
  assert.equal(tp.amount, 2000);
  assert.equal(s.window.tildaForm.amountForStat, 2000, "purchase value = what was sent");
  assert.equal(s.hidden("bonus_ref"), null);
});

test("payment rebuild: Tilda builds the payment again without the code; cart and purchase value are full", () => {
  const s = setup({ hold: liveHold(), delivery: 70 });
  s.guard();
  s.tick(50 * MIN);
  const tp = s.tildaSubmit();
  assert.equal(tp.promocode, undefined);
  assert.equal(tp.amount, 2070);
  assert.equal(s.window.tildaForm.amountForStat, 2070);
  assert.equal(s.window.tcart.promocode, undefined, "cart (and localStorage tcart for section 12) without the code");
  assert.equal(s.window.tcart.amount, 2070);
});

test("payment rebuild: if Tilda then refuses the order, the cart window shows the real sum", async () => {
  const s = setup({ promocode: { promocode: CODE, discountsum: 300 } });
  s.tildaSubmit(); // the click went through (no hold), Tilda builds the payment
  const before = s.shown.length;
  await flush();
  assert.ok(s.shown.length > before, "redrawn after the send");
  assert.equal(s.shown[s.shown.length - 1], 2000);
  assert.match(s.note(), /Час резерву минув/);
});

test("Enter in the SMS code field confirms the code instead of submitting the order", async () => {
  const s = setup({ phone: "+38 (067) 111-22-33" });
  const ev = s.keyEnter(s.codeInput);
  assert.equal(ev.prevented, true, "no implicit form submission");
  await flush();
  assert.ok(s.calls.some((c) => c.path === "/verify" && c.body.code === "123456"));
  // Enter anywhere else is left alone.
  const ev2 = s.keyEnter(s.phone);
  assert.equal(ev2.prevented, false);
});
