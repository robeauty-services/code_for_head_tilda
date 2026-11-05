/* Section 3 of src/head.js, the pure parts:
 *
 *   parseTildaCartData -> one cart parse for Meta (pixel, CAPI), GA4 and TikTok;
 *                         a SKU with letters (KU-0003413) or one missing from
 *                         map_content_ids stays in contents as its own id
 *   isProductPage      -> decided by the path only: utm_campaign=CBO_TEST no
 *                         longer switches ViewContent off
 *
 * The pieces are cut out of the file by their first lines and run in node:vm.
 * No dependencies: `npm test`.
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
const helpers = cut(
  "  var skuFromName = ",
  (l) => l === "    return result;",
) + "\n  };";
const isProductPageSrc = cut("    var isProductPage = () => {", (l) => l === "    };");

const section3 = () => {
  const context = { String, Number, Array, Object };
  vm.runInNewContext(
    `${mapBlock}\n${helpers}\nthis.parse = parseTildaCartData; this.map = map_content_ids;`,
    context,
  );
  return context;
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
