/* Section 3 of src/head.js, the pure parts:
 *
 *   parseTildaCartData -> one cart parse for Meta (pixel, CAPI), GA4 and TikTok;
 *                         a SKU with letters (KU-0003413) or one missing from
 *                         map_content_ids stays in contents as its own id
 *   isProductPage      -> decided by the path only: utm_campaign=CBO_TEST no
 *                         longer switches ViewContent off
 *   pickViewedProduct  -> which product ViewContent is about: a t744 SKU field
 *                         that is only a caption is not an id, a button in the
 *                         "bought together" block is an upsell, editionuid
 *                         never borrows another product's price
 *
 * The pieces are cut out of the file by their first lines and run in node:vm,
 * the DOM ones against a tiny element stub. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const cut = (first, isLast) => {
  const start = lines.findIndex((l) => l.startsWith(first));
  assert.ok(start > -1, `not found: ${first}`);
  const end = lines.findIndex((l, i) => i > start && isLast(l));
  return lines.slice(start, end + 1).join("\n");
};

const mapBlock = cut("  var map_content_ids = {", (l) => l === "  };");
const shadowBlock = cut(
  "  var sku_by_shadowed_content_id = {",
  (l) => l === "  };",
);
const helpers = cut(
  "  var skuFromName = ",
  (l) => l === "    return result;",
) + "\n  };";
const isProductPageSrc = cut("    var isProductPage = () => {", (l) => l === "    };");
// productFromOrderButton, productFromCard, inCrossSell and pickViewedProduct
// sit together; cut through the end of pickViewedProduct.
const viewedSrc = (() => {
  const start = lines.findIndex((l) =>
    l.startsWith("    var productFromOrderButton = (btn) => {"),
  );
  const pick = lines.findIndex((l) => l.startsWith("    var pickViewedProduct = () => {"));
  assert.ok(start > -1 && pick > start, "view-content helpers not found");
  const end = lines.findIndex((l, i) => i > pick && l === "    };");
  return lines.slice(start, end + 1).join("\n");
})();

const section3 = () => {
  const context = { String, Number, Array, Object };
  vm.runInNewContext(
    `${mapBlock}\n${shadowBlock}\n${helpers}\nthis.parse = parseTildaCartData; this.map = map_content_ids; this.skuForContentId = skuForContentId;`,
    context,
  );
  return context;
};

// --- Tiny DOM: enough for querySelector(All) with ".a .b, tag[attr^=\"x\"]",
// closest(), getAttribute(), className, parentElement, textContent.
const SIMPLE = /^([a-z]*)((?:\.[\w-]+)*)(?:\[([\w-]+)\^="([^"]*)"\])?$/;
class El {
  constructor(tag, attrs, children) {
    this.tagName = tag.toUpperCase();
    this.attrs = attrs || {};
    this.className = this.attrs.class || "";
    this.parentElement = null;
    this.children = [];
    this.text = "";
    for (const c of children || []) {
      if (typeof c === "string") this.text += c;
      else {
        c.parentElement = this;
        this.children.push(c);
      }
    }
  }
  get textContent() {
    return this.text + this.children.map((c) => c.textContent).join("");
  }
  getAttribute(name) {
    return name in this.attrs ? this.attrs[name] : null;
  }
  matchesSimple(sel) {
    const m = SIMPLE.exec(sel);
    assert.ok(m, `stub selector not supported: ${sel}`);
    const [, tag, classes, attr, prefix] = m;
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    const own = this.className.split(/\s+/);
    for (const c of classes.split(".").filter(Boolean)) if (!own.includes(c)) return false;
    if (attr && !String(this.getAttribute(attr) || "").startsWith(prefix)) return false;
    return true;
  }
  matches(selList) {
    return selList.split(",").some((sel) => {
      const parts = sel.trim().split(/\s+/);
      if (!this.matchesSimple(parts.pop())) return false;
      let e = this.parentElement;
      while (parts.length && e) {
        if (e.matchesSimple(parts[parts.length - 1])) parts.pop();
        e = e.parentElement;
      }
      return parts.length === 0;
    });
  }
  closest(sel) {
    for (let e = this; e; e = e.parentElement) if (e.matches(sel)) return e;
    return null;
  }
  querySelectorAll(sel) {
    const out = [];
    const walk = (e) => {
      for (const c of e.children) {
        if (c.matches(sel)) out.push(c);
        walk(c);
      }
    };
    walk(this);
    return out;
  }
  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }
}
const h = (tag, attrs, ...children) => new El(tag, attrs, children);
const orderBtn = (name, sku, price) =>
  h("a", { href: `#order:${encodeURIComponent(`${name} [sku:${sku}]=${price}`)}:::image=x.jpg` });
const t744 = (name, skuText, price, uid) =>
  h("div", { class: "t744" },
    h("div", Object.assign({ class: "js-product" }, uid ? { "data-product-uid": uid } : {}),
      h("h2", { class: "js-product-name" }, name),
      h("span", { class: "js-store-prod-sku js-product-sku" }, ` ${skuText} `),
      h("div", { class: "js-product-price", "data-product-price-def": String(price) }, String(price)),
    ),
  );

const viewed = (search, ...nodes) => {
  const body = h("body", {}, ...nodes);
  const context = {
    String, Number, Array, Object, RegExp, decodeURIComponent, parseFloat,
    window: { location: { search } },
    document: { body, querySelectorAll: (s) => body.querySelectorAll(s) },
  };
  vm.runInNewContext(
    `${mapBlock}\n${shadowBlock}\n${helpers}\n${viewedSrc}\nthis.result = pickViewedProduct();`,
    context,
  );
  const r = plain(context.result);
  return { id: r.id, price: r.price, name: r.name };
};

const isProductPage = (pathname) => {
  const context = { window: { location: { pathname } }, String, RegExp };
  vm.runInNewContext(`${isProductPageSrc}\nthis.result = isProductPage();`, context);
  return context.result;
};

// Objects built inside the vm have the vm's prototypes; compare plain copies.
const plain = (x) => JSON.parse(JSON.stringify(x));

test("KU-* SKU stays in the cart instead of being dropped", () => {
  const { parse, map } = section3();
  const cart = {
    prodamount: "3048",
    products: [
      { name: "Anti-Stress набір [sku:KU-0003413]", price: "1959", quantity: 1, amount: "1959" },
      { name: "Антивіковий SPF 50 [sku:00-00002574]", price: "490", quantity: 2, amount: "980" },
      { name: "Пінка (00-00002011)", price: "109", quantity: 1, amount: "109" },
      { name: "Доставка", id: "delivery", price: "0" },
    ],
  };
  const r = plain(parse(cart));
  assert.deepEqual(r.content_ids, ["KU-0003413", map["00-00002574"], map["00-00002011"]]);
  assert.equal(r.num_items, 4);
  assert.equal(r.value, 3048);
  assert.deepEqual(r.ga_items[0], {
    item_id: "KU-0003413",
    item_name: "Anti-Stress набір",
    currency: "UAH",
    price: 1959,
    quantity: 1,
  });
  assert.deepEqual(r.contents[1], { id: map["00-00002574"], quantity: 2, item_price: 490 });
});

test("words in brackets are not SKUs", () => {
  const { parse } = section3();
  const r = plain(
    parse({
      prodamount: "449",
      products: [{ name: "Тонік (medium) (30мл)", price: "449", quantity: 1 }],
    }),
  );
  assert.deepEqual(r.content_ids, []);
  assert.equal(r.value, 449);
});

test("store item keeps its uid", () => {
  const { parse } = section3();
  const r = plain(
    parse({
      prodamount: "389",
      products: [{ name: "Сироватка", uid: "991012571252", price: "389", quantity: 1 }],
    }),
  );
  assert.deepEqual(r.content_ids, ["991012571252"]);
});

test("duplicate map keys: the id present in feed-fb.csv wins", () => {
  const { map } = section3();
  assert.equal(map["00-00002536"], "624341789722");
  assert.equal(map["00-00003113"], "694245873222");
  assert.equal(map["00-00000018"], "457399131532");
});

test("isProductPage looks at the path only", () => {
  // utm with "test" lived in the query and used to drop ViewContent.
  assert.equal(isProductPage("/lifting-cream"), true);
  assert.equal(isProductPage("/testers"), true); // test kit product page
  assert.equal(isProductPage("/products/tproduct/123-name"), true);

  for (const p of [
    "/",
    "/products",
    "/thanks",
    "/thanks1",
    "/thx-claude",
    "/b2b-partners-40",
    "/season-sale-pg",
    "/test-page",
    "/test_basket_np",
    "/night-eyelid-lifting-eye-serum-v1-test-vlad",
    "/cosmetics-testing-eyes",
    "/testboard",
    "/footer-lk",
    "/about-us",
    "/morning",
    "/gift-certificates",
    "/showtockers",
  ]) {
    assert.equal(isProductPage(p), false, p);
  }
});

test("t744 SKU field: only a real SKU in it is an id, a caption is not", () => {
  const { parse, map } = section3();
  // /drymilkn: "Код товару: 00-00000103" -> its catalog id.
  assert.deepEqual(
    viewed("", t744("Парфумований хайлайтер для тіла", "Код товару: 00-00000103", 590)),
    { id: map["00-00000103"], price: 590, name: "Парфумований хайлайтер для тіла" },
  );
  // /body_fluid: "Об'єм: 250 ml" is a caption -> no id, as before the PR.
  assert.deepEqual(viewed("", t744("Флюїд для тіла з ефектом шовку", "Об'єм: 250 ml", 790)), {
    id: null,
    price: 0,
    name: "Unknown Product",
  });
  // The same caption in a cart line's sku must not become a content id.
  const r = plain(
    parse({
      prodamount: "1380",
      products: [
        { name: "Флюїд для тіла з ефектом шовку", sku: "Об'єм: 250 ml", price: "790", quantity: 1 },
        { name: "Парфумований хайлайтер", sku: "Код товару: 00-00000103", price: "590", quantity: 1 },
        { name: "Anti-Stress набір", sku: "KU-0003413", price: "1959", quantity: 1 },
      ],
    }),
  );
  assert.deepEqual(r.content_ids, [map["00-00000103"], "KU-0003413"]);
});

test("a button in the 'bought together' block is an upsell, not the page product", () => {
  const { map } = section3();
  // night-retinol-serum: the PureGlow upsell comes first and every button is
  // there once; the page product is the first button outside rbs-fbt.
  const page = viewed(
    "",
    h("div", { class: "rbs-sec rbs-fbt" },
      h("div", { class: "rbs-xcard" }, orderBtn("PureGlow Foam Cleanser", "00-00002011", 290)),
    ),
    orderBtn("Нічна сироватка з ретинолом", "00-00002541", 789),
  );
  assert.deepEqual(page, { id: map["00-00002541"], price: 789, name: "Нічна сироватка з ретинолом" });

  // anti-wrinkle-eye-cream: the cream's own button comes first; the serum
  // sold alongside has more buttons, but frequency no longer outranks it.
  const eye = viewed(
    "",
    orderBtn("Крем від мімічних зморшок біля очей", "00-00000220", 590),
    ...Array.from({ length: 4 }, () =>
      h("div", { class: "rb-pair" }, orderBtn("Сироватка", "00-00002574", 490)),
    ),
    orderBtn("Сироватка", "00-00002574", 490),
  );
  assert.equal(eye.id, map["00-00000220"]);
  assert.equal(eye.price, 590);

  // Only upsell buttons on the page: the most frequent one is still used.
  const onlyXsell = viewed(
    "",
    h("div", { class: "x-comps" },
      orderBtn("A", "00-00002011", 290),
      orderBtn("B", "00-00002574", 490),
      orderBtn("B", "00-00002574", 490),
    ),
  );
  assert.equal(onlyXsell.id, map["00-00002574"]);
});

test("editionuid takes price and name of that product only", () => {
  const { map } = section3();
  // /burnscrub?editionuid=931790046321: a shadowed duplicate of 00-00000077;
  // the 250 ml button carries that SKU, the page's main card is the 550 ml.
  const burn = viewed(
    "?editionuid=931790046321",
    t744("Скраб 550 ml", "Код товару: 00-00000078", 990),
    orderBtn("Скраб 250 ml", "00-00000077", 659),
  );
  assert.deepEqual(burn, { id: "931790046321", price: 659, name: "Скраб 250 ml" });
  assert.notEqual(map["00-00000077"], "931790046321"); // shadowed in the object

  // Nothing on the page has it: no borrowed price or name.
  assert.deepEqual(
    viewed("?editionuid=111111111111", t744("Скраб 550 ml", "Код товару: 00-00000078", 990)),
    { id: "111111111111", price: 0, name: "Unknown Product" },
  );

  // Exact id on a button still wins.
  assert.deepEqual(
    viewed("?editionuid=" + map["00-00002574"], orderBtn("SPF 50", "00-00002574", 490)),
    { id: map["00-00002574"], price: 490, name: "SPF 50" },
  );
});

test("every id written in map_content_ids, shadowed or commented, finds its SKU", () => {
  const { skuForContentId } = section3();
  const pairs = [...mapBlock.matchAll(/"([^"]+)": "(\d+)"/g)];
  assert.ok(pairs.length > 150);
  for (const [, sku, id] of pairs) assert.equal(skuForContentId(id), sku, `${id} -> ${sku}`);
  assert.equal(skuForContentId("000"), null);
});
