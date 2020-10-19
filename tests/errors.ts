// require("regenerator-runtime/runtime");
import test from "ava";
import FP from "../src/index.js";
import {
  FunctionalError,
  FPInputError,
  FPCollectionError,
} from "../src/modules/errors.js";

const onUnhandledRejection = (error) => {
  // Will print "unhandledRejection err is not defined"
  console.error("unhandledRejection", error.message);
};

test.before(() => {
  process.on("unhandledRejection", onUnhandledRejection);
});
// test.after(() => {
//   process.off('unhandledRejection', onUnhandledRejection)
// })

test("FunctionalError has expected message", (t) => {
  const error = new FunctionalError("Oh noes!");
  t.plan(1);
  t.is(error.message, "Oh noes!");
});
test("FunctionalError has custom properties", (t) => {
  const error = new FunctionalError("Oh noes!", { custom: 42 });
  t.plan(2);
  t.is(error.message, "Oh noes!");
  // @ts-ignore
  t.is(error.custom, 42);
});
test("FunctionalError supports object-based message argument", (t) => {
  const error = new FunctionalError({ message: "Oh noes!" });
  t.plan(1);
  t.is(error.message, "Oh noes!");
});
test("FunctionalError supports object-based argument w/ custom properties", (t) => {
  const error = new FunctionalError({ message: "Oh noes!", custom: 42 });
  t.plan(2);
  t.is(error.message, "Oh noes!");
  // @ts-ignore
  t.is(error.custom, 42);
});

test("FPInputError has expected message", (t) => {
  // @ts-ignore
  const error = new FPInputError("Oh noes!");
  t.plan(1);
  t.is(error.message, "Oh noes!");
});
test("FPInputError has custom properties", (t) => {
  // @ts-ignore
  const error = new FPInputError("Oh noes!", { custom: 42 });
  t.plan(2);
  t.is(error.message, "Oh noes!");
  t.is(error.custom, 42);
});
test("FPInputError supports object-based message argument", (t) => {
  // @ts-ignore
  const error = new FPInputError({ message: "Oh noes!" });
  t.plan(1);
  t.is(error.message, "Oh noes!");
});
test("FPInputError supports object-based argument w/ custom properties", (t) => {
  // @ts-ignore
  const error = new FPInputError({ message: "Oh noes!", custom: 42 });
  t.plan(2);
  t.is(error.message, "Oh noes!");
  t.is(error.custom, 42);
});
test("FPCollectionError has expected message", (t) => {
  // @ts-ignore
  const error = new FPCollectionError("Oh noes!");
  t.plan(1);
  t.is(error.message, "Oh noes!");
});
test("FPCollectionError has custom properties", (t) => {
  // @ts-ignore
  const error = new FPCollectionError("Oh noes!", { custom: 42 });
  t.plan(2);
  t.is(error.message, "Oh noes!");
  t.is(error.custom, 42);
});

test("Can .catch() thrown Errors", (t) => {
  return FP.resolve()
    .then(() => {
      throw new TypeError("Single toss");
    })
    .tap(() => t.fail("must skip to the .catch section!"))
    .catch((err) => t.truthy(err.message === "Single toss"));
});

test("Can override .catch() results", (t) => {
  return FP.resolve()
    .then(() => {
      throw new TypeError("Single toss");
    })
    .tap(() => t.fail("must skip to the .catch section!"))
    .catch((err) => ({ message: "temp error, plz try again", _err: err }))
    .then((data) => t.truthy(data.message === "temp error, plz try again"));
});

test("Does .catchIf(filterType, fn) filtering by TypeError", (t) => {
  return FP.resolve()
    .then(() => {
      throw new Error("Oh noes");
    })
    .tap(() => t.fail("must skip to the .catch section!"))
    .catchIf(TypeError, () => t.fail("arg too specific for .catch(type)"))
    .catchIf(SyntaxError, () => t.fail("arg too specific for .catch(type)"))
    .catchIf(ReferenceError, () => t.fail("arg too specific for .catch(type)"))
    .catch((err) => t.truthy(err.message === "Oh noes"));
});

test("Does .catchIf(filterType, fn) skip negative tests", (t) => {
  return (
    FP.resolve()
      .then(() => {
        throw new TypeError("Oh noes");
      })
      .tap(() => t.fail("must skip to the .catch section!"))
      .catchIf(ReferenceError, () =>
        t.fail("arg too specific for .catch(type)")
      )
      .catchIf(SyntaxError, () => t.fail("arg too specific for .catch(type)"))
      .catchIf(TypeError, () => t.pass("successfully filtered .catch(type)"))
      // @ts-ignore
      .catch((err) => t.fail(err.message === "Oh noes"))
  );
});

test("Does .catch(filterType, fn) filtering by TypeError", (t) => {
  return FP.resolve()
    .then(() => {
      throw new Error("Oh noes");
    })
    .tap(() => t.fail("must skip to the .catch section!"))
    .catch(TypeError, () => t.fail("arg too specific for .catch(type)"))
    .catch(SyntaxError, () => t.fail("arg too specific for .catch(type)"))
    .catch(ReferenceError, () => t.fail("arg too specific for .catch(type)"))
    .catch((err) => t.truthy(err.message === "Oh noes"));
});

test("Does .catch(filterType, fn) skip negative tests", (t) => {
  return (
    FP.resolve()
      .then(() => {
        throw new TypeError("Oh noes");
      })
      .tap(() => t.fail("must skip to the .catch section!"))
      .catch(ReferenceError, () => t.fail("arg too specific for .catch(type)"))
      .catch(SyntaxError, () => t.fail("arg too specific for .catch(type)"))
      .catch(TypeError, () => t.pass("successfully filtered .catch(type)"))
      // @ts-ignore
      .catch((err) => t.fail(err.message === "Oh noes"))
  );
});

test("Can override .catch() w/ .chain()", (t) => {
  const pipeline = FP.chain()
    .map(() => FP.reject(new Error("Fail!")))
    .chainEnd();

  return pipeline([1])
    .then((result) => {
      // console.log(result)
      t.fail("FAIL: unexpected .then hit");
    })
    .catch(() => t.pass("Testing Expected Error"));
});

// @ts-ignore
test("Can override .catch() w/ .chain().quiet()", (t) => {
  const pipeline = FP.chain()
    .quiet(3)
    .map(() => FP.reject(new Error("Fail!")))
    .chainEnd();

  return Promise.all([
    pipeline([1])
      .then(() => t.pass("Silenced err correctly!"))
      .catch(() => t.fail("Error failed .quiet()")),
    pipeline([1, 2, 3, 4])
      .then(() => t.fail("FAIL: Should have fired a .catch()!"))
      .catch(() => t.pass("Success: Exceeded .quiet() error limit")),
  ]);
});
