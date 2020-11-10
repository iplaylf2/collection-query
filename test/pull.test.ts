import { createFrom, forEach, map, filter } from "../pull";
import { PullStream } from "..";
import "./jest";
import * as t from "./pull/test";

describe("pull", () => {
  describe("create", () => {
    t.TestBase(() => function* () {});
  });

  describe("createFrom", () => {
    t.TestEmptyCollection((f) => {
      const empty = createFrom("");
      for (const _ of empty()) {
        f();
      }
    });

    const data = "collection-query";

    t.TestTwoCollectionEqual(() => createFrom(data), data, "same collection");
    t.TestIdempotent(() => createFrom(data));
  });

  describe("foreach", () => {
    const empty = createFrom("");

    t.TestEmptyCollection((f) => forEach(empty, f));

    const data = "collection-query";
    const s = createFrom(data);

    t.TestCollectionEachIn(
      (f) => forEach(s, f),
      () => Array.from(data).map((x) => [x])
    );
  });

  describe("map", () => {
    const empty = createFrom("");

    t.TestEmptyCollection((f) => pullAll(map(f)(empty)));

    const data = "collection-query";
    const s = createFrom(data);

    t.TestCollectionEachIn(
      (f) => pullAll(map(f)(s)),
      () => Array.from(data).map((x) => [x])
    );

    t.TestCollectionEachOut(
      (f) => toArray(map(f)(s)),
      (r1) => r1,
      "map<f,a[]> == f<a>[]"
    );
  });

  describe("filter", () => {
    const empty = createFrom("");

    t.TestEmptyCollection((f) => {
      const p = () => (f(), true);
      pullAll(filter(p)(empty));
    });

    const data = "collection-query";
    const s = createFrom(data);

    t.TestCollectionEachIn(
      (f) => {
        const p = (x: any) => (f(x), true);
        return pullAll(filter(p)(s));
      },
      () => Array.from(data).map((x) => [x])
    );
  });
});

function pullAll(s: PullStream<any>) {
  for (const _ of s());
}

function toArray(s: PullStream<any>) {
  return Array.from(s());
}
