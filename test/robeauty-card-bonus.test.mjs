/* Section 16 of src/head.js: the A/B "+50 ₴ in bonuses for paying by card".
 *
 *   group   -> held by hand (?rbpay=), else GrowthBook's `card_pay_incentive`,
 *              asked only while the main cart is open; unknown feature = none
 *   field   -> hidden `ab_variant` on the main cart form, in both groups
 *   group B -> card caption, note under the payment block, line under the
 *              cashback row while the card is chosen; survives a redraw
 *   /thanks -> the line after a card order of group B only
 *
 * The block (header 16 to the end of the file) runs in node:vm with a small
 * fake DOM. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const start = lines.findIndex((l) => l.startsWith("/* ===================== 16. Card payment incentive"));
assert.ok(start > -1, "no header 16");
const block = lines.slice(start).join("\n");

const MAIN_FORM = "form665507684";
const NOW = 1_700_000_000_000;

/* ---------- a fake DOM: just enough for the selectors section 16 uses ---------- */

class El {
  constructor(tag, doc) {
    this.tag = tag;
    this.doc = doc;
    this.children = [];
    this.parentElement = null;
    this.attrs = {};
    this.className = "";
    this.hidden = false;
    this.value = "";
    this.checked = false;
    this.text = "";
    this.classList = {
      add: (c) => {
        if (!this.classList.contains(c)) this.className = (this.className + " " + c).trim();
      },
      contains: (c) => this.className.split(/\s+/).includes(c),
    };
  }
  get parentNode() {
    return this.parentElement;
  }
  get previousElementSibling() {
    if (!this.parentElement) return null;
    const sibs = this.parentElement.children;
    return sibs[sibs.indexOf(this) - 1] || null;
  }
  detach() {
    if (!this.parentElement) return;
    const sibs = this.parentElement.children;
    sibs.splice(sibs.indexOf(this), 1);
    this.parentElement = null;
  }
  set id(v) {
    this.attrs.id = v;
  }
  get id() {
    return this.attrs.id || "";
  }
  set name(v) {
    this.attrs.name = v;
  }
  get name() {
    return this.attrs.name || "";
  }
  set type(v) {
    this.attrs.type = v;
  }
  set textContent(v) {
    this.children = [];
    this.text = String(v);
    this.doc.writes++;
  }
  get textContent() {
    return this.text + this.children.map((c) => c.textContent).join("");
  }
  appendChild(node) {
    node.parentElement = this;
    this.children.push(node);
    this.doc.writes++;
    return node;
  }
  insertBefore(node, ref) {
    node.parentElement = this;
    this.children.splice(this.children.indexOf(ref), 0, node);
    this.doc.writes++;
    return node;
  }
  insertAdjacentElement(where, node) {
    assert.equal(where, "afterend");
    node.detach(); // a node lives in one place, as in a browser
    const sibs = this.parentElement.children;
    node.parentElement = this.parentElement;
    sibs.splice(sibs.indexOf(this) + 1, 0, node);
    this.doc.writes++;
    return node;
  }
  matches(sel) {
    // tag? .class* [attr="v"]*
    const m = sel.match(/^([a-z]+)?((?:\.[\w-]+)*)((?:\[[\w-]+="[^"]*"\])*)$/);
    assert.ok(m, "selector not supported by the fake DOM: " + sel);
    if (m[1] && m[1] !== this.tag) return false;
    for (const c of m[2].split(".").filter(Boolean)) if (!this.classList.contains(c)) return false;
    for (const a of m[3].matchAll(/\[([\w-]+)="([^"]*)"\]/g)) {
      const have = a[1] === "value" ? this.value : this.attrs[a[1]];
      if (have !== a[2]) return false;
    }
    return true;
  }
  all() {
    return this.children.flatMap((c) => [c, ...c.all()]);
  }
  querySelector(sel) {
    return this.all().find((n) => n.matches(sel)) || null;
  }
  closest(sel) {
    let n = this;
    while (n && !n.matches(sel)) n = n.parentElement;
    return n || null;
  }
}

/* The main cart as the site draws it: payment radios with captions, a cashback
 * row, the order form. `compact` = the compact cart's cashback line is there. */
const build = ({ pathname = "/", search = "", open = true, compact = true, totals: withTotals = true, gb = null, session = {}, local = {}, off = false } = {}) => {
  const doc = { writes: 0 };
  const el = (tag, cls = "", attrs = {}) => {
    const n = new El(tag, doc);
    n.className = cls;
    Object.assign(n.attrs, attrs);
    return n;
  };
  const html = el("html");
  const head = el("head");
  const body = el("body", open ? "t706__body_cartwinshowed" : "");
  html.appendChild(head);
  html.appendChild(body);
  const cart = body.appendChild(el("div", "t706"));
  const form = cart.appendChild(el("form", "", { id: MAIN_FORM }));
  const wrap = form.appendChild(el("div", "t-radio__wrapper-payment"));
  const option = (value, text, checked) => {
    const label = wrap.appendChild(el("label", "t-radio__control"));
    const input = label.appendChild(el("input", "", { name: "paymentsystem" }));
    input.value = value;
    input.checked = checked;
    const caption = label.appendChild(el("span", "paylabel"));
    caption.text = text;
    return { label, input, caption };
  };
  const cash = option("cash", "Накладений платіж", true);
  const card = option("wayforpay", "Оплата картою / частинами", false);
  // `totals: false` = the footer blocks have not drawn them yet
  const totals = el("div", "rb-totals");
  const cashbackRow = el("div", "rb-cashback");
  if (compact) cashbackRow.appendChild(el("div", "rbc-cashback-line"));
  if (withTotals) {
    form.appendChild(totals);
    form.appendChild(cashbackRow);
  }
  const rbt = pathname === "/thanks" ? body.appendChild(el("div", "", { id: "rbt" })) : null;
  doc.writes = 0;

  const listeners = {};
  const document = {
    readyState: "complete",
    documentElement: html,
    head,
    body,
    createElement: (tag) => el(tag),
    getElementById: (id) => html.all().find((n) => n.id === id) || null,
    querySelector: (sel) => {
      // ".t706 x" style selectors are not used at document level here
      return html.all().find((n) => n.matches(sel)) || null;
    },
    addEventListener: (type, fn) => {
      (listeners[type] = listeners[type] || []).push(fn);
    },
  };
  const storage = (seed) => {
    const store = { ...seed };
    return {
      store,
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => {
        store[k] = String(v);
      },
      removeItem: (k) => {
        delete store[k];
      },
    };
  };
  const sessionStorage = storage(session);
  const localStorage = storage(local);
  const timers = [];
  const window = { console, location: { pathname, search }, RB_CARD_BONUS_OFF: off };
  if (gb) window.growthbook_queue = { push: (fn) => fn(gb) };
  class MutationObserver {
    observe() {}
  }
  const ctx = {
    window,
    document,
    sessionStorage,
    localStorage,
    MutationObserver,
    setTimeout: (fn) => timers.push(fn),
    setInterval: (fn) => {
      ctx.tick = fn;
    },
    Date: { now: () => NOW },
    JSON,
    String,
    decodeURIComponent,
    console,
  };
  vm.runInNewContext(block, ctx);
  const flush = () => {
    while (timers.length) timers.shift()();
  };
  flush();
  return { window, doc, html, body, cart, form, wrap, cash, card, totals, cashbackRow, rbt, listeners, sessionStorage, localStorage, flush, tick: () => ctx.tick() };
};

/* GrowthBook as section 16 sees it: evalFeature and nothing else. */
const growthbook = (value, source = "experiment") => {
  const asked = [];
  return {
    asked,
    evalFeature: (key) => {
      asked.push(key);
      return value === undefined ? { value: null, source: "unknownFeature" } : { value, source };
    },
  };
};

const fieldValue = (page) => {
  const input = page.form.querySelector('input[name="ab_variant"]');
  return input ? input.value : null;
};

/* ---------- the pure parts ---------- */

const api = build().window.__rbCardBonus;

test("preview: ?rbpay holds a group for the tab, reset lets go, junk changes nothing", () => {
  const store = {};
  const storage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
  };
  assert.equal(api.previewVariant("", storage), null);
  assert.equal(api.previewVariant("?rbpay=bonus_50", storage), "bonus_50");
  assert.equal(api.previewVariant("", storage), "bonus_50"); // the tab remembers
  assert.equal(api.previewVariant("?utm_source=x&rbpay=hacked", storage), "bonus_50");
  assert.equal(api.previewVariant("?a=1&rbpay=control", storage), "control");
  assert.equal(api.previewVariant("?rbpay=reset", storage), null);
  assert.equal(api.previewVariant("?rbpay=%E0%A4%A", storage), null); // broken escape
});

test("GrowthBook: a group only for a known feature with one of the two values", () => {
  assert.equal(api.featureVariant(growthbook("bonus_50")), "bonus_50");
  assert.equal(api.featureVariant(growthbook("control")), "control");
  assert.equal(api.featureVariant(growthbook("bonus_50", "force")), "bonus_50"); // rolled out to everyone
  assert.equal(api.featureVariant(growthbook(undefined)), null); // not created / not loaded
  assert.equal(api.featureVariant(growthbook("card_perk")), null); // a group this code does not draw
  assert.equal(api.featureVariant(null), null);
  assert.equal(api.featureVariant({}), null);
});

test("the bonus line follows the chosen payment, in group B only", () => {
  assert.equal(api.lineShown("bonus_50", "wayforpay"), true);
  assert.equal(api.lineShown("bonus_50", "cash"), false);
  assert.equal(api.lineShown("control", "wayforpay"), false);
});

test("/thanks line: group B, a card order placed after the group was known, within two hours", () => {
  const group = (variant, ts) => JSON.stringify({ v: 1, variant, ts });
  const link = (ts) => JSON.stringify({ v: 1, ref: "2095616_1", order: "1", t: "x", ts });
  assert.equal(api.thanksLineDue(group("bonus_50", NOW - 600_000), link(NOW - 60_000), NOW), true);
  assert.equal(api.thanksLineDue(group("control", NOW - 600_000), link(NOW - 60_000), NOW), false);
  assert.equal(api.thanksLineDue(group("bonus_50", NOW - 600_000), null, NOW), false); // paid on delivery
  assert.equal(api.thanksLineDue(group("bonus_50", NOW - 9e6), link(NOW - 8e6), NOW), false); // an old order
  assert.equal(api.thanksLineDue(group("bonus_50", NOW - 60_000), link(NOW - 600_000), NOW), false); // group came later
  assert.equal(api.thanksLineDue(null, link(NOW - 60_000), NOW), false);
  assert.equal(api.thanksLineDue("{broken", link(NOW - 60_000), NOW), false);
});

/* ---------- the cart ---------- */

test("no feature in GrowthBook: the cart is untouched and no field is written", () => {
  const gb = growthbook(undefined);
  const page = build({ gb });
  page.tick();
  assert.equal(fieldValue(page), null);
  assert.equal(page.doc.writes, 0);
  assert.equal(page.card.caption.textContent, "Оплата картою / частинами");
  assert.equal(page.localStorage.store.rb_pay_ab, undefined);
});

test("GrowthBook is not asked while the cart is closed", () => {
  const gb = growthbook("bonus_50");
  const page = build({ gb, open: false });
  page.tick();
  assert.deepEqual(gb.asked, []);
  assert.equal(fieldValue(page), null);
  page.body.className = "t706__body_cartwinshowed";
  page.tick();
  assert.deepEqual(gb.asked, ["card_pay_incentive"]);
  assert.equal(fieldValue(page), "bonus_50");
});

test("control: the field says control, nothing in the cart changes", () => {
  const page = build({ gb: growthbook("control") });
  assert.equal(fieldValue(page), "control");
  assert.equal(page.card.caption.textContent, "Оплата картою / частинами");
  assert.equal(page.cart.querySelector(".rb-pay-b__note"), null);
  assert.equal(page.cart.querySelector(".rb-pay-b__line"), null);
  assert.equal(page.html.classList.contains("rb-pay-b"), false);
});

test("group B: caption, note, and the line only while the card is chosen", () => {
  const page = build({ gb: growthbook("bonus_50") });
  assert.equal(fieldValue(page), "bonus_50");
  assert.equal(page.html.classList.contains("rb-pay-b"), true);
  assert.equal(page.card.caption.textContent, "Карткою онлайн +50 ₴ бонусами");
  assert.equal(page.cash.caption.textContent, "Накладений платіж");
  // the note sits right under the payment block
  const afterWrap = page.form.children[page.form.children.indexOf(page.wrap) + 1];
  assert.equal(afterWrap.className, "rb-pay-b__note");
  // the line sits right under the cashback line, hidden while cash is chosen
  const line = page.cart.querySelector(".rb-pay-b__line");
  assert.equal(page.cashbackRow.children[1], line);
  assert.equal(line.hidden, true);

  page.cash.input.checked = false;
  page.card.input.checked = true;
  page.listeners.change[0]({ target: page.card.input });
  page.flush();
  assert.equal(line.hidden, false);

  page.card.input.checked = false;
  page.cash.input.checked = true;
  page.tick();
  assert.equal(line.hidden, true);
});

test("group B: a second run writes nothing; a redrawn caption gets its text back", () => {
  const page = build({ gb: growthbook("bonus_50") });
  const before = page.doc.writes;
  page.tick();
  page.tick();
  assert.equal(page.doc.writes, before);
  // the footer block redraws the payment captions
  page.card.caption.textContent = "Оплата картою / частинами";
  page.tick();
  assert.equal(page.card.caption.textContent, "Карткою онлайн +50 ₴ бонусами");
  assert.equal(page.form.all().filter((n) => n.className === "rb-pay-b__note").length, 1);
  assert.equal(page.form.all().filter((n) => n.className === "rb-pay-b__line").length, 1);
});

test("group B without the compact cart: the line goes under the totals", () => {
  const page = build({ gb: growthbook("bonus_50"), compact: false });
  const line = page.cart.querySelector(".rb-pay-b__line");
  assert.equal(page.form.children[page.form.children.indexOf(page.totals) + 1], line);
});

test("group B drawn before the totals exist: the line moves under the cashback row when it appears", () => {
  const page = build({ gb: growthbook("bonus_50"), totals: false });
  const line = page.cart.querySelector(".rb-pay-b__line");
  assert.equal(line.previousElementSibling.className, "rb-pay-b__note");
  // the footer blocks draw the totals and the cashback row
  page.form.appendChild(page.totals);
  page.form.appendChild(page.cashbackRow);
  page.tick();
  assert.equal(page.cashbackRow.children[1], line);
  assert.equal(page.form.all().filter((n) => n.className === "rb-pay-b__line").length, 1);
  const before = page.doc.writes;
  page.tick();
  assert.equal(page.doc.writes, before);
});

test("the stored group keeps its first date while the group is the same", () => {
  const earlier = JSON.stringify({ v: 1, variant: "bonus_50", ts: NOW - 5_000 });
  const same = build({ gb: growthbook("bonus_50"), local: { rb_pay_ab: earlier } });
  assert.equal(same.localStorage.store.rb_pay_ab, earlier);
  const other = build({ gb: growthbook("control"), local: { rb_pay_ab: earlier } });
  assert.deepEqual(JSON.parse(other.localStorage.store.rb_pay_ab), { v: 1, variant: "control", ts: NOW });
});

test("the group is kept for the page even if GrowthBook changes its mind", () => {
  let value = "bonus_50";
  const gb = { evalFeature: () => ({ value, source: "experiment" }) };
  const page = build({ gb });
  assert.equal(fieldValue(page), "bonus_50");
  value = "control";
  page.tick();
  assert.equal(fieldValue(page), "bonus_50");
});

test("?rbpay=bonus_50 draws group B without asking GrowthBook, cart closed or not", () => {
  const gb = growthbook("control");
  const page = build({ gb, open: false, search: "?rbpay=bonus_50" });
  assert.deepEqual(gb.asked, []);
  assert.equal(fieldValue(page), "bonus_50");
  assert.equal(page.card.caption.textContent, "Карткою онлайн +50 ₴ бонусами");
});

test("the group is remembered for /thanks", () => {
  const page = build({ gb: growthbook("bonus_50") });
  assert.deepEqual(JSON.parse(page.localStorage.store.rb_pay_ab), { v: 1, variant: "bonus_50", ts: NOW });
});

test("RB_CARD_BONUS_OFF: nothing at all", () => {
  const gb = growthbook("bonus_50");
  const page = build({ gb, off: true });
  page.tick();
  assert.deepEqual(gb.asked, []);
  assert.equal(page.doc.writes, 0);
});

/* ---------- /thanks ---------- */

const thanksStore = (variant, linkAge = 60_000) => ({
  rb_pay_ab: JSON.stringify({ v: 1, variant, ts: NOW - 600_000 }),
  ...(linkAge === null ? {} : { rb_pay_link: JSON.stringify({ v: 1, ref: "2095616_1", order: "1", t: "x", ts: NOW - linkAge }) }),
});

test("/thanks after a card order of group B: one line above the upsell block", () => {
  const page = build({ pathname: "/thanks", open: false, local: thanksStore("bonus_50") });
  const box = page.body.children[page.body.children.indexOf(page.rbt) - 1];
  assert.equal(box.className, "rb-pay-b__thanks");
  assert.equal(box.textContent, "+50 ₴ бонусами нарахуємо після отримання посилки");
});

test("/thanks: no line for control, for an order paid on delivery, or on another page", () => {
  const none = (opts) => assert.equal(build(opts).body.querySelector(".rb-pay-b__thanks"), null);
  none({ pathname: "/thanks", open: false, local: thanksStore("control") });
  none({ pathname: "/thanks", open: false, local: thanksStore("bonus_50", null) });
  none({ pathname: "/", open: false, local: thanksStore("bonus_50") });
  none({ pathname: "/thanks", open: false, local: thanksStore("bonus_50"), off: true });
});
