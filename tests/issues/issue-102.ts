import test from "ava";
import FP from "../../";

test("Issue #102, Resolving multiple times: Promise behavior", (t) => {
  t.plan(1);

  const p = new Promise((yah, nah) => {
    yah(42);
    yah(-1);
  });
  return p.then((value) => {
    t.assert(value === 42);
  });
});

test("Issue #102, Resolving multiple times: FP behavior", (t) => {
  t.plan(1);

  const p = new FP((yah, nah) => {
    yah(42);
    yah(-1);
  });
  return p.then((value) => {
    t.assert(value === 42);
  });
});


test("Issue #102, Rejecting multiple times: Promise behavior", (t) => {
  t.plan(1);

  const p = new Promise((yah, nah) => {
    nah(42);
    nah(-1);
  });
  return p
  .then(() => {})
  .catch((value) => {
    t.assert(value === 42);
  });
});

test("Issue #102, Rejecting multiple times: FP behavior", (t) => {
  t.plan(1);

  const p = new FP((yah, nah) => {
    nah(42);
    nah(-1);
  });
  return p
  .then(() => {})
  .catch((value) => {
    t.assert(value === 42);
  });
});
