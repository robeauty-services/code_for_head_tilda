/* Section 14 (failed payment -> /payment-result): on /thanks, a confirmed card
 * refusal sends the customer to /payment-result?ref=…&t=…; anything else keeps
 * her on /thanks. Runs the section in node:vm with fake window, storage, fetch
 * and timers, plus the loader it shows meanwhile (the class on <html> and the
 * <style> it inserts). The block = src/head.js from header 14 to header 15.
 * No dependencies: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SRC = new URL("../src/head.js", import.meta.url);
const source = readFileSync(SRC, "utf8");
const lines = source.split("\n");
const start = lines.findIndex((l) => l.startsWith("/* ===================== 14. Failed payment"));
const end = lines.findIndex((l) => l.startsWith("/* ===================== 15. Rescued payment"));
const block = lines.slice(start, end).join("\n");

const NOW = 1_700_000_000_000;
const RECORD = { v: 1, ref: "2095616_1158838403", order: "1158838403", t: "Zm9vYmFyYmF6cXV1eA", ts: NOW - 60_000 };
const TARGET = "/payment-result?ref=2095616_1158838403&t=Zm9vYmFyYmF6cXV1eA";

/* `answers` = what /status returns, one per call: [httpStatus, body] or "neterr".
 * `hang` = a request that never answers at all. `classLog` records every class
 * the block puts on or takes off <html>, in order; `classAtGo` is a copy of it
 * taken the moment location.replace was called. */
const run = async ({ pathname = "/thanks", record = RECORD, answers = [], session = {}, off = false, loaderOff = false, hang = false } = {}) => {
  const replaced = [];
  const requests = [];
  const classLog = [];
  const styles = [];
  let classAtGo = null;
  const store = record === null ? {} : { rb_pay_link: JSON.stringify(record) };
  const document = {
    documentElement: {
      className: "",
      classList: {
        add: (c) => classLog.push("+" + c),
        remove: (c) => classLog.push("-" + c),
      },
    },
    head: { appendChild: (node) => styles.push(node) },
    createElement: () => ({ id: "", textContent: "" }),
    getElementById: (id) => styles.filter((n) => n.id === id)[0] || null,
  };
  const window = {
    console,
    location: {
      pathname,
      replace: (u) => {
        replaced.push(u);
        classAtGo = classLog.slice();
      },
    },
    RB_PAY_REDIRECT_OFF: off,
    RB_PAY_LOADER_OFF: loaderOff,
  };
  const localStorage = { getItem: (k) => (k in store ? store[k] : null) };
  const sessionStore = { ...session };
  const sessionStorage = {
    getItem: (k) => (k in sessionStore ? sessionStore[k] : null),
    setItem: (k, v) => { sessionStore[k] = String(v); },
  };
  let i = 0;
  const fetch = (url) => {
    requests.push(url);
    if (hang) return new Promise(() => {});
    const a = answers[i++] ?? [200, { status: "pending" }];
    if (a === "neterr") return Promise.reject(new Error("net"));
    const [status, body] = a;
    return Promise.resolve({ status, json: () => Promise.resolve(body) });
  };
  // Virtual time: timers run at once, but in the order the delays put them,
  // so the 8 s loader ceiling cannot overtake a check due at 0 s. A cleared
  // timer (the request timeout once fetch has answered) is dropped.
  const queue = [];
  let nextId = 1;
  let clock = 0;
  const setTimeout = (fn, ms) => {
    const id = nextId++;
    queue.push({ id, fn, at: clock + (Number(ms) || 0) });
    return id;
  };
  const clearTimeout = (id) => { const k = queue.findIndex((t) => t.id === id); if (k >= 0) queue.splice(k, 1); };
  const takeDue = () => {
    let k = -1;
    for (let j = 0; j < queue.length; j++) {
      const better = k < 0 || queue[j].at < queue[k].at ||
        (queue[j].at === queue[k].at && queue[j].id < queue[k].id);
      if (better) k = j;
    }
    if (k < 0) return null;
    const t = queue.splice(k, 1)[0];
    clock = t.at;
    return t;
  };
  vm.runInNewContext(block, {
    window, localStorage, sessionStorage, document, fetch, setTimeout, clearTimeout,
    console, JSON, String, Date: { now: () => NOW }, encodeURIComponent, Promise,
  });
  // Stop once nothing has been scheduled for several turns of the event loop.
  for (let idle = 0, guard = 0; idle < 10 && guard < 1000; guard++) {
    await new Promise((r) => setImmediate(r));
    const t = takeDue();
    if (t) { idle = 0; t.fn(); } else idle++;
  }
  return {
    replaced, requests, sessionStore, classLog, classAtGo,
    css: styles.map((n) => n.textContent).join(""),
    api: window.__rbPayRedirect,
  };
};

test("declined: redirected to /payment-result with ref and t", async () => {
  const { replaced, requests, sessionStore } = await run({ answers: [[200, { status: "declined" }]] });
  assert.deepEqual(replaced, [TARGET]);
  assert.equal(requests.length, 1);
  assert.match(requests[0], /\/payment-rescue\/status\?ref=2095616_1158838403&t=Zm9vYmFyYmF6cXV1eA$/);
  assert.equal(sessionStore["rb_pay_redirect:2095616_1158838403"], "1");
});

test("expired: redirected", async () => {
  const { replaced } = await run({ answers: [[200, { status: "expired" }]] });
  assert.deepEqual(replaced, [TARGET]);
});

test("pending, then declined: redirected after the second check", async () => {
  const { replaced, requests } = await run({ answers: [[200, { status: "pending" }], [200, { status: "declined" }]] });
  assert.deepEqual(replaced, [TARGET]);
  assert.equal(requests.length, 2);
});

test("approved: stays on /thanks, one check only", async () => {
  const { replaced, requests } = await run({ answers: [[200, { status: "approved" }]] });
  assert.deepEqual(replaced, []);
  assert.equal(requests.length, 1);
});

for (const st of ["cod", "reordered", "something_new"]) {
  test(`${st}: stays on /thanks`, async () => {
    const { replaced } = await run({ answers: [[200, { status: st }]] });
    assert.deepEqual(replaced, []);
  });
}

test("pending all along: gives up after the schedule, stays on /thanks", async () => {
  const { replaced, requests, api } = await run({ answers: [] });
  assert.deepEqual(replaced, []);
  assert.equal(requests.length, api.SCHEDULE.length);
});

for (const code of [400, 401, 404, 410]) {
  test(`HTTP ${code}: stays, no retry`, async () => {
    const { replaced, requests } = await run({ answers: [[code, null]] });
    assert.deepEqual(replaced, []);
    assert.equal(requests.length, 1);
  });
}

test("409 busy and 502 are retried", async () => {
  const { replaced, requests } = await run({ answers: [[409, null], [502, null], [200, { status: "declined" }]] });
  assert.deepEqual(replaced, [TARGET]);
  assert.equal(requests.length, 3);
});

test("network error is retried", async () => {
  const { replaced } = await run({ answers: ["neterr", [200, { status: "declined" }]] });
  assert.deepEqual(replaced, [TARGET]);
});

test("not /thanks: nothing is asked", async () => {
  for (const pathname of ["/", "/thanks1", "/thx-claude", "/payment-result"]) {
    const { requests } = await run({ pathname, answers: [[200, { status: "declined" }]] });
    assert.equal(requests.length, 0, pathname);
  }
});

test("/thanks/ with a trailing slash counts", async () => {
  const { replaced } = await run({ pathname: "/thanks/", answers: [[200, { status: "declined" }]] });
  assert.deepEqual(replaced, [TARGET]);
});

test("no record, broken, stale or future record: nothing is asked", async () => {
  for (const record of [null, { v: 2, ref: "x", t: "y", ts: NOW }, { ...RECORD, ts: NOW - 3 * 3600_000 }, { ...RECORD, ts: NOW + 60_000 }]) {
    const { requests } = await run({ record, answers: [[200, { status: "declined" }]] });
    assert.equal(requests.length, 0, JSON.stringify(record));
  }
});

test("already redirected once in this tab: nothing is asked", async () => {
  const { requests } = await run({ session: { "rb_pay_redirect:2095616_1158838403": "1" } });
  assert.equal(requests.length, 0);
});

test("off switch", async () => {
  const { requests } = await run({ off: true });
  assert.equal(requests.length, 0);
});

test("decide(): the table", async () => {
  const { api } = await run({ record: null });
  assert.equal(api.decide(200, { status: "declined" }), "go");
  assert.equal(api.decide(200, { status: "expired" }), "go");
  assert.equal(api.decide(200, { status: "pending" }), "wait");
  assert.equal(api.decide(200, { status: "approved" }), "stop");
  assert.equal(api.decide(200, null), "stop");
  assert.equal(api.decide(409, null), "wait");
  assert.equal(api.decide(503, null), "wait");
  assert.equal(api.decide(410, null), "stop");
});

/* ---------- the loader shown while the checks run ---------- */

const LOADER = "rb-pay-checking";

test("loader: hidden page and a spinner while the checks run", async () => {
  const { classLog, css } = await run({ answers: [[200, { status: "approved" }]] });
  // Put on first, taken off once the answer said the money is in.
  assert.deepEqual(classLog, ["+" + LOADER, "-" + LOADER]);
  assert.match(css, /html\.rb-pay-checking body\{visibility:hidden\}/);
  assert.match(css, /Перевіряємо оплату…/);
  assert.match(css, /animation:rb-pay-spin/);
  assert.match(css, /prefers-reduced-motion/);
});

test("loader: never shown without a fresh record", async () => {
  for (const record of [null, { ...RECORD, ts: NOW - 3 * 3600_000 }]) {
    const { classLog, css } = await run({ record, answers: [[200, { status: "declined" }]] });
    assert.deepEqual(classLog, [], JSON.stringify(record));
    assert.equal(css, "");
  }
  // Nor on another page, nor for an order already redirected in this tab.
  assert.deepEqual((await run({ pathname: "/" })).classLog, []);
  assert.deepEqual((await run({ session: { "rb_pay_redirect:2095616_1158838403": "1" } })).classLog, []);
});

test("loader: stays on when the refusal is confirmed", async () => {
  const { classLog, classAtGo, replaced } = await run({ answers: [[200, { status: "declined" }]] });
  assert.deepEqual(replaced, [TARGET]);
  // Still on at the moment of the redirect, and the ceiling cannot lift it.
  assert.deepEqual(classAtGo, ["+" + LOADER]);
  assert.deepEqual(classLog, ["+" + LOADER]);
});

test("loader: the ceiling shows the page even if nothing ever answers", async () => {
  const { classLog, replaced, requests } = await run({ hang: true });
  assert.deepEqual(classLog, ["+" + LOADER, "-" + LOADER]);
  assert.deepEqual(replaced, []);
  // The checks themselves carry on past the ceiling, as before.
  assert.ok(requests.length > 1);
});

test("loader: taken off at the end of the schedule, and on an HTTP error", async () => {
  assert.deepEqual((await run({ answers: [] })).classLog, ["+" + LOADER, "-" + LOADER]);
  assert.deepEqual((await run({ answers: [[410, null]] })).classLog, ["+" + LOADER, "-" + LOADER]);
});

test("loader: its own off switch leaves the checks and the redirect alone", async () => {
  const { classLog, css, replaced, requests } = await run({
    loaderOff: true,
    answers: [[200, { status: "declined" }]],
  });
  assert.deepEqual(classLog, []);
  assert.equal(css, "");
  assert.deepEqual(replaced, [TARGET]);
  assert.equal(requests.length, 1);
});
