/* Section 13 of src/head.js: on /payment-result it puts `ref` and `t` back
 * into the address from the record section 12 left in localStorage, before the
 * page block reads it.
 *
 *   samePage / hasOrderParam -> when the block may act at all
 *   parseRecord / isFresh    -> what counts as a usable record
 *   buildUrl                 -> the address it hands to history.replaceState
 *
 * The block (from the section 13 header to the end of the file) runs in
 * node:vm with a fake window, history and storage. No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/head.js", import.meta.url), "utf8");
const lines = source.split("\n");
const start = lines.findIndex((l) => l.startsWith("/* ===================== 13. Payment result link"));
const block = lines.slice(start).join("\n");

const NOW = 1_700_000_000_000;
const RECORD = { v: 1, ref: "2095616_1158838403", order: "1158838403", t: "Zm9vYmFyYmF6cXV1eA", ts: NOW };

/* `where` is the address the customer landed on; `record` is what section 12
 * stored (null for nothing at all). Returns the replaceState calls. */
const load = ({ pathname = "/payment-result", search = "", hash = "", record = RECORD, now = NOW } = {}) => {
  const calls = [];
  const store = record === null ? {} : { rb_pay_link: JSON.stringify(record) };
  const window = {
    console,
    location: { pathname, search, hash },
    history: {
      state: { page: 1 },
      replaceState: (state, title, url) => calls.push({ state, title, url }),
    },
  };
  const localStorage = { getItem: (k) => (k in store ? store[k] : null) };
  const FrozenDate = { now: () => now };
  vm.runInNewContext(block, { window, localStorage, console, JSON, String, RegExp, encodeURIComponent, Date: FrozenDate });
  return { calls, api: window.__rbPayLink };
};

test("no parameters at all: ref and t are put back", () => {
  const { calls } = load();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].state, { page: 1 }); // the history entry is kept
  assert.equal(calls[0].url, "/payment-result?ref=2095616_1158838403&t=Zm9vYmFyYmF6cXV1eA");
});

test("an address that already names the order is left alone", () => {
  assert.equal(load({ search: "?ref=2095616_999&t=x" }).calls.length, 0);
  assert.equal(load({ search: "?order=999" }).calls.length, 0);
  assert.equal(load({ search: "?t=x&ref=2095616_999" }).calls.length, 0);
});

test("other pages are never touched", () => {
  assert.equal(load({ pathname: "/" }).calls.length, 0);
  assert.equal(load({ pathname: "/thanks" }).calls.length, 0);
  assert.equal(load({ pathname: "/payment-results" }).calls.length, 0);
  // A trailing slash is the same page.
  assert.equal(load({ pathname: "/payment-result/" }).calls.length, 1);
});

test("a record that is too old, broken or missing changes nothing", () => {
  assert.equal(load({ record: Object.assign({}, RECORD, { ts: NOW - 73 * 3600 * 1000 }) }).calls.length, 0);
  assert.equal(load({ record: Object.assign({}, RECORD, { ts: NOW + 60 * 1000 }) }).calls.length, 0);
  assert.equal(load({ record: Object.assign({}, RECORD, { v: 2 }) }).calls.length, 0);
  assert.equal(load({ record: Object.assign({}, RECORD, { t: "" }) }).calls.length, 0);
  assert.equal(load({ record: null }).calls.length, 0);
  // Three hours before the deadline it still works.
  assert.equal(load({ record: Object.assign({}, RECORD, { ts: NOW - 69 * 3600 * 1000 }) }).calls.length, 1);
});

test("parameters the page already carried, and the hash, survive", () => {
  const { calls } = load({ search: "?utm_source=viber&x=1", hash: "#top" });
  assert.equal(
    calls[0].url,
    "/payment-result?ref=2095616_1158838403&t=Zm9vYmFyYmF6cXV1eA&utm_source=viber&x=1#top",
  );
});

test("values are escaped", () => {
  const { api } = load();
  const url = api.buildUrl("/payment-result", "", "", { ref: "2095616_1 2", t: "a+b/c" });
  assert.equal(url, "/payment-result?ref=2095616_1%202&t=a%2Bb%2Fc");
});

test("a broken record is not a usable one", () => {
  const { api } = load();
  assert.equal(api.parseRecord("{not json"), null);
  assert.equal(api.parseRecord("null"), null);
  assert.equal(api.parseRecord(null), null);
  assert.equal(api.parseRecord(JSON.stringify({ v: 1, ref: "r", t: "t" })), null); // no ts
  assert.equal(api.isFresh(null, NOW), false);
});
